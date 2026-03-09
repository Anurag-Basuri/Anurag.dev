import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import sensible from '@fastify/sensible';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env } from './config/env';
import { AppError } from './lib/errors';

import publicRoutes from './routes/public.routes';
import authRoutes from './modules/auth/auth.routes';
import contactRoutes from './modules/contact/contact.routes';
import adminRoutes from './modules/admin/admin.routes';

export function buildApp() {
	const app = Fastify({
		logger: {
			level: process.env.LOG_LEVEL || 'info',
		},
	});

	// ─── Plugins ──────────────────────────────────────────────────

	app.register(cors, {
		origin: env.CORS_ORIGIN.split(',').map(o => o.trim()),
		credentials: true,
	});

	app.register(sensible);

	app.register(fastifyJwt, {
		secret: env.JWT_SECRET,
	});

	// Swagger docs — development only
	if (env.NODE_ENV === 'development') {
		app.register(swagger, {
			openapi: {
				info: { title: 'AnuragOS API', version: '0.1.0' },
				components: {
					securitySchemes: {
						bearerAuth: {
							type: 'http',
							scheme: 'bearer',
							bearerFormat: 'JWT',
						},
					},
				},
			},
		});
		app.register(swaggerUi, {
			routePrefix: '/api-docs',
			uiConfig: { docExpansion: 'none' },
		});
	}

	// ─── Routes ───────────────────────────────────────────────────

	app.register(publicRoutes);
	app.register(authRoutes);
	app.register(contactRoutes);
	app.register(adminRoutes);

	// ─── Global Error Handler ─────────────────────────────────────

	app.setErrorHandler((err: Error, request, reply) => {
		// Known application errors
		if (err instanceof AppError) {
			return reply.status(err.statusCode).send(err.toJSON());
		}

		// Fastify validation errors (from schema validation)
		if ('validation' in err && (err as any).validation) {
			return reply.status(400).send({
				error: {
					code: 'VALIDATION_ERROR',
					message: 'Request validation failed',
					details: (err as any).validation,
					timestamp: new Date().toISOString(),
				},
			});
		}

		// Log unexpected errors
		request.log.error(err);

		// Never leak internal details in production
		const statusCode =
			'statusCode' in err && typeof (err as any).statusCode === 'number'
				? (err as any).statusCode
				: 500;
		return reply.status(statusCode).send({
			error: {
				code:
					statusCode === 500
						? 'INTERNAL_ERROR'
						: 'code' in err
							? (err as any).code
							: 'ERROR',
				message: statusCode === 500 ? 'Internal server error' : err.message,
				timestamp: new Date().toISOString(),
			},
		});
	});

	return app;
}
