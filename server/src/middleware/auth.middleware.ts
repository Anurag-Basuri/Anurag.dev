import { FastifyRequest, FastifyReply } from 'fastify';
import { verifyAccessToken, TokenPayload } from '../modules/auth/auth.service';
import { unauthorized, AppError } from '../lib/errors';

// Extend FastifyRequest to include admin data
declare module 'fastify' {
	interface FastifyRequest {
		admin?: TokenPayload;
	}
}

/**
 * Authentication middleware — verifies Bearer token and attaches admin info to request.
 */
export async function authMiddleware(request: FastifyRequest, reply: FastifyReply): Promise<void> {
	try {
		const authHeader = request.headers.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			const error = unauthorized('Authorization token required');
			return reply.status(error.statusCode).send(error.toJSON());
		}

		const token = authHeader.substring(7);
		const payload = verifyAccessToken(token);

		if (!payload) {
			const error = unauthorized('Invalid or expired token');
			return reply.status(error.statusCode).send(error.toJSON());
		}

		request.admin = payload;
	} catch (err) {
		if (err instanceof AppError) {
			return reply.status(err.statusCode).send(err.toJSON());
		}
		const error = unauthorized('Authentication failed');
		return reply.status(error.statusCode).send(error.toJSON());
	}
}
