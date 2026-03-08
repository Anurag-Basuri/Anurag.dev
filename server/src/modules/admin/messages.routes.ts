import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { prisma } from '../../lib/db';
import { notFound } from '../../lib/errors';
import { logAudit } from '../../lib/audit';
import { validateQuery } from '../../middleware/validate';

const PaginationQuery = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

export default async function messagesRoutes(fastify: FastifyInstance) {
	// GET /api/admin/messages — paginated list
	fastify.get(
		'/api/admin/messages',
		{ preHandler: [validateQuery(PaginationQuery)] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const { page, limit } = request.query as z.infer<typeof PaginationQuery>;
			const skip = (page - 1) * limit;

			const [items, total] = await Promise.all([
				prisma.contactMessage.findMany({
					orderBy: { createdAt: 'desc' },
					skip,
					take: limit,
				}),
				prisma.contactMessage.count(),
			]);

			return reply.send({
				items,
				total,
				page,
				limit,
				totalPages: Math.ceil(total / limit),
			});
		},
	);

	// GET /api/admin/messages/:id — get single + mark as read
	fastify.get(
		'/api/admin/messages/:id',
		async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
			const { id } = request.params;

			const message = await prisma.contactMessage.findUnique({ where: { id } });
			if (!message) {
				const error = notFound('Message');
				return reply.status(error.statusCode).send(error.toJSON());
			}

			// Mark as read if not already
			if (!message.isRead) {
				await prisma.contactMessage.update({
					where: { id },
					data: { isRead: true },
				});
			}

			return reply.send({ ...message, isRead: true });
		},
	);

	// DELETE /api/admin/messages/:id
	fastify.delete(
		'/api/admin/messages/:id',
		async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
			const { id } = request.params;
			const adminId = request.user!.adminId;

			const existing = await prisma.contactMessage.findUnique({ where: { id } });
			if (!existing) {
				const error = notFound('Message');
				return reply.status(error.statusCode).send(error.toJSON());
			}

			await prisma.contactMessage.delete({ where: { id } });

			await logAudit({
				adminId,
				action: 'delete',
				resourceType: 'ContactMessage',
				resourceId: id,
				changes: { from: existing.name, subject: existing.subject },
			});

			return reply.send({ message: 'Message deleted' });
		},
	);
}
