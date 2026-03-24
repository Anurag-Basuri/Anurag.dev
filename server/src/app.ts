import express, { Request, Response, NextFunction } from 'express';
import applyCors from './middleware/cors.middleware';
import { env } from './config/env';
import { ApiError, isApiError } from './utils/ApiError';
import { ZodError } from 'zod';
import { Prisma } from '../generated/prisma';

import publicRoutes from './routes/public.routes';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import docsRoutes from './routes/docs.routes';
import chatRoutes from './routes/chat.routes';

const app = express();

// Security & Parsing
app.disable('x-powered-by');
app.use(applyCors);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static('public'));

// API v1 Routes
app.use('/api/v1', publicRoutes);
app.use('/api/v1', docsRoutes);
app.use('/api/v1', authRoutes);
app.use('/api/v1', chatRoutes);
app.use('/api/v1/admin', adminRoutes);

// Invalid Route Handler
app.use((req, _res, next) => {
	next(
		new ApiError(404, `Cannot ${req.method} ${req.originalUrl}`, {
			details: {
				method: req.method,
				url: req.originalUrl,
				hint: 'Check the API docs at /api/v1/docs for available endpoints',
			},
		}),
	);
});

// ═══════════════════════════════════════════════════════════════════
// GLOBAL ERROR HANDLER
// Handles: ApiError, ZodError, PrismaClientKnownRequestError, and
// generic unknown errors — all in one place.
// ═══════════════════════════════════════════════════════════════════

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
	if (res.headersSent) return;

	const isDevMode = env.NODE_ENV === 'development';

	// ─── 1. ApiError (thrown explicitly by our code) ─────────────

	if (isApiError(err)) {
		if (!err.isOperational || isDevMode) {
			console.error('[error-handler] ApiError', {
				status: err.statusCode,
				message: err.message,
				source: err.source ?? 'unknown',
				details: err.details ?? null,
				method: req.method,
				url: req.originalUrl,
				ip: req.ip,
				...(isDevMode && { stack: err.stack }),
			});
		}

		res.status(err.statusCode).json(err.toJSON());
		return;
	}

	// ─── 2. ZodError (validation failure not caught by middleware) ─

	if (err instanceof ZodError) {
		const apiErr = ApiError.ValidationError(err, 'body');
		console.error('[error-handler] ZodError', {
			message: apiErr.message,
			details: apiErr.details,
			method: req.method,
			url: req.originalUrl,
		});

		res.status(apiErr.statusCode).json(apiErr.toJSON());
		return;
	}

	// ─── 3. Prisma Known Request Error (constraint violations) ────

	if (err instanceof Prisma.PrismaClientKnownRequestError) {
		const apiErr = ApiError.fromPrisma(err);
		console.error('[error-handler] PrismaError', {
			prismaCode: err.code,
			message: apiErr.message,
			details: apiErr.details,
			method: req.method,
			url: req.originalUrl,
		});

		res.status(apiErr.statusCode).json(apiErr.toJSON());
		return;
	}

	// ─── 4. Prisma Validation Error (schema/type mismatch) ────────

	if (err instanceof Prisma.PrismaClientValidationError) {
		// Extract the useful part from Prisma's verbose multi-line message
		const lines = err.message.split('\n').filter(l => l.trim());
		const shortMessage = lines[lines.length - 1]?.trim() || 'Invalid data sent to database';

		console.error('[error-handler] PrismaValidationError', {
			message: shortMessage,
			method: req.method,
			url: req.originalUrl,
			...(isDevMode && { fullMessage: err.message }),
		});

		const apiErr = ApiError.BadRequest(shortMessage, {
			hint: 'Check that all fields match the expected types',
		});
		res.status(apiErr.statusCode).json(apiErr.toJSON());
		return;
	}

	// ─── 5. Fallback — unknown/unexpected errors ──────────────────

	console.error('[error-handler] UNEXPECTED ERROR', {
		message: err instanceof Error ? err.message : String(err),
		method: req.method,
		url: req.originalUrl,
		ip: req.ip,
		stack: err instanceof Error ? err.stack : undefined,
	});

	res.status(500).json({
		success: false,
		error: {
			code: 500,
			message: isDevMode && err instanceof Error ? err.message : 'Internal Server Error',
			...(isDevMode && err instanceof Error && { stack: err.stack }),
		},
		timestamp: new Date().toISOString(),
	});
});

export default app;
