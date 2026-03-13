import express, { Request, Response, NextFunction } from 'express';
import applyCors from './middleware/cors.middleware';
import { env } from './config/env';
import { ApiError, isApiError } from './utils/ApiError';

import publicRoutes from './routes/public.routes';
import authRoutes from './routes/auth.routes';
import contactRoutes from './routes/contact.routes';
import adminRoutes from './routes/admin.routes';

const app = express();

// ─── Security & Parsing ─────────────────────────────────────
app.disable('x-powered-by');
app.use(applyCors);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static('public'));

// ─── Routes ──────────────────────────────────────────────────
app.use(publicRoutes);
app.use(authRoutes);
app.use(contactRoutes);
app.use(adminRoutes);

// ─── 404 Handler ─────────────────────────────────────────────
app.use((_req, _res, next) => {
	next(new ApiError(404, 'Route not found'));
});

// ─── Global Error Handler ────────────────────────────────────
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
	// Already sent response — nothing else we can do
	if (res.headersSent) return;

	const isDevMode = env.NODE_ENV === 'development';

	if (isApiError(err)) {
		// Operational errors — log only non-4xx or if in dev mode
		if (!err.isOperational || isDevMode) {
			console.error('[error-handler]', {
				status: err.statusCode,
				message: err.message,
				source: err.source ?? 'unknown',
				method: req.method,
				url: req.originalUrl,
				ip: req.ip,
				...(isDevMode && { stack: err.stack }),
			});
		}

		res.status(err.statusCode).json(err.toJSON());
		return;
	}

	// Unexpected / programming errors — always log with full detail
	console.error('[error-handler] UNEXPECTED ERROR', {
		message: err instanceof Error ? err.message : String(err),
		method: req.method,
		url: req.originalUrl,
		ip: req.ip,
		stack: err instanceof Error ? err.stack : undefined,
	});

	res.status(500).json({
		error: {
			code: 500,
			message: isDevMode && err instanceof Error ? err.message : 'Internal Server Error',
			...(isDevMode && err instanceof Error && { stack: err.stack }),
			timestamp: new Date().toISOString(),
		},
	});
});

export default app;
