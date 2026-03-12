import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { env } from './config/env';
import { ApiError, isApiError } from './utils/ApiError';

import publicRoutes from './routes/public.routes';
// TODO: Re-enable once .env-based admin auth is implemented
// import authRoutes from './modules/auth/auth.routes';
import contactRoutes from './routes/contact/contact.routes';
// import adminRoutes from './modules/admin/admin.routes';

export function buildApp() {
	const app = express();

	// ─── Middleware ────────────────────────────────────────────────

	app.use(
		cors({
			origin: env.CORS_ORIGIN.split(',').map(o => o.trim()),
			credentials: true,
		}),
	);

	app.use(express.json());

	// ─── Routes ───────────────────────────────────────────────────

	app.use(publicRoutes);
	// app.use(authRoutes);
	app.use(contactRoutes);
	// app.use(adminRoutes);

	// ─── 404 Handler ──────────────────────────────────────────────

	app.use((_req, _res, next) => {
		next(ApiError.NotFound('Route not found'));
	});

	// ─── Global Error Handler ─────────────────────────────────────

	app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
		if (isApiError(err)) {
			res.status(err.statusCode).json(err.toJSON());
			return;
		}

		// Unexpected / non-ApiError errors — log full details, return generic 500
		console.error('[error-handler] unhandled error:', err);

		const message =
			env.NODE_ENV === 'development' && err instanceof Error
				? err.message
				: 'Internal Server Error';

		res.status(500).json({
			error: {
				code: 500,
				message,
				timestamp: new Date().toISOString(),
			},
		});
	});

	return app;
}
