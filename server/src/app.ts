import express, { Request, Response, NextFunction } from 'express';
import applyCors from './middleware/cors.middleware';
import { env } from './config/env';
import { ApiError, isApiError } from './utils/ApiError';

import publicRoutes from './routes/public.routes';
// TODO: Re-enable once .env-based admin auth is implemented
// import authRoutes from './routes/auth/auth.routes';
import contactRoutes from './routes/contact/contact.routes';
// import adminRoutes from './routes/admin/admin.routes';

const app = express();

// ─── Security & Parsing ─────────────────────────────────────
app.disable('x-powered-by');
app.use(applyCors);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(express.static('public'));

// ─── Routes ──────────────────────────────────────────────────
app.use(publicRoutes);
// app.use(authRoutes);
app.use(contactRoutes);
// app.use(adminRoutes);

// ─── 404 Handler ─────────────────────────────────────────────
app.use((_req, _res, next) => {
	next(new ApiError(404, 'Route not found'));
});

// ─── Global Error Handler ────────────────────────────────────
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
	if (isApiError(err)) {
		res.status(err.statusCode).json(err.toJSON());
		return;
	}

	const isDevMode = env.NODE_ENV === 'development';

	console.error('[error-handler] unhandled error:', err);

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
