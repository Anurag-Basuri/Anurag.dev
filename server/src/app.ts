import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';
import { notFound } from './lib/errors';

import publicRoutes from './routes/public.routes';
import authRoutes from './modules/auth/auth.routes';
import contactRoutes from './modules/contact/contact.routes';
import adminRoutes from './modules/admin/admin.routes';

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
	app.use(authRoutes);
	app.use(contactRoutes);
	app.use(adminRoutes);

	// ─── 404 Handler ──────────────────────────────────────────────

	app.use((_req, _res, next) => {
		next(notFound('Route'));
	});

	// ─── Centralized Error Handler (must be last) ─────────────────

	app.use(errorHandler);

	return app;
}
