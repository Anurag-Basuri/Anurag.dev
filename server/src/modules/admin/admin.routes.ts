import { FastifyInstance } from 'fastify';
import { authMiddleware } from '../../middleware/auth.middleware';
import profileRoutes from './profile.routes';
import projectRoutes from './project.routes';
import journeyRoutes from './journey.routes';
import achievementRoutes from './achievement.routes';
import certificationRoutes from './certification.routes';
import blogRoutes from './blog.routes';
import messagesRoutes from './messages.routes';

/**
 * Admin route registrar.
 * All sub-routes require authentication.
 */
export default async function adminRoutes(fastify: FastifyInstance) {
	// Apply auth middleware to all routes in this scope
	fastify.addHook('preHandler', authMiddleware);

	fastify.register(profileRoutes);
	fastify.register(projectRoutes);
	fastify.register(journeyRoutes);
	fastify.register(achievementRoutes);
	fastify.register(certificationRoutes);
	fastify.register(blogRoutes);
	fastify.register(messagesRoutes);
}
