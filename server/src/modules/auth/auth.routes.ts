import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/db';
import {
	verifyPassword,
	generateTokenPair,
	rotateRefreshToken,
	revokeRefreshToken,
} from './auth.service';
import { validate } from '../../middleware/validate';
import { rateLimit } from '../../middleware/rate-limit';
import { unauthorized, AppError } from '../../lib/errors';
import { authMiddleware } from '../../middleware/auth.middleware';

// ─── Schemas ──────────────────────────────────────────────────────

const LoginSchema = z.object({
	username: z.string().min(1, 'Username is required'),
	password: z.string().min(1, 'Password is required'),
});

const RefreshSchema = z.object({
	refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ─── Routes ───────────────────────────────────────────────────────

export default async function authRoutes(fastify: FastifyInstance) {
	// POST /api/auth/login
	fastify.post(
		'/api/auth/login',
		{
			preHandler: [
				rateLimit({ max: 10, windowSeconds: 15 * 60, prefix: 'login' }),
				validate(LoginSchema),
			],
		},
		async (request: FastifyRequest, reply: FastifyReply) => {
			const { username, password } = request.body as z.infer<typeof LoginSchema>;

			const admin = await prisma.admin.findUnique({ where: { username } });

			if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
				const error = unauthorized('Invalid username or password');
				return reply.status(error.statusCode).send(error.toJSON());
			}

			const tokens = await generateTokenPair({
				adminId: admin.id,
				username: admin.username,
			});

			return reply.send(tokens);
		},
	);

	// POST /api/auth/refresh
	fastify.post(
		'/api/auth/refresh',
		{ preHandler: [validate(RefreshSchema)] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const { refreshToken } = request.body as z.infer<typeof RefreshSchema>;

			try {
				const tokens = await rotateRefreshToken(refreshToken);
				return reply.send(tokens);
			} catch (err) {
				if (err instanceof AppError) {
					return reply.status(err.statusCode).send(err.toJSON());
				}
				throw err;
			}
		},
	);

	// POST /api/auth/logout
	fastify.post(
		'/api/auth/logout',
		{ preHandler: [authMiddleware] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const { refreshToken } = (request.body as { refreshToken?: string }) || {};

			if (refreshToken) {
				await revokeRefreshToken(refreshToken);
			}

			return reply.send({ message: 'Logged out successfully' });
		},
	);

	// GET /api/auth/me
	fastify.get(
		'/api/auth/me',
		{ preHandler: [authMiddleware] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const admin = await prisma.admin.findUnique({
				where: { id: request.admin!.adminId },
				select: { id: true, username: true, createdAt: true },
			});

			if (!admin) {
				const error = unauthorized('Admin not found');
				return reply.status(error.statusCode).send(error.toJSON());
			}

			return reply.send(admin);
		},
	);
}
