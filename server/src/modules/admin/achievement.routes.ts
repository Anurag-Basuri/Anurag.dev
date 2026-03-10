import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/db';
import { validate } from '../../middleware/validate';
import { logAudit } from '../../lib/audit';
import { notFound } from '../../lib/errors';
import { AchievementSchema } from '../../schemas/zod-schemas';

const AchievementUpdateSchema = AchievementSchema.partial().omit({ id: true });

const ReorderSchema = z.object({
	items: z.array(
		z.object({
			id: z.string(),
			order: z.number().int().min(0),
		}),
	),
});

export default async function achievementRoutes(fastify: FastifyInstance) {
	// GET /api/admin/achievements
	fastify.get('/api/admin/achievements', async (_req, reply) => {
		const items = await prisma.achievement.findMany({
			orderBy: { order: 'asc' },
			include: { journeyEntry: { select: { id: true, title: true, type: true } } },
		});
		return reply.send({ items });
	});

	// POST /api/admin/achievements
	fastify.post(
		'/api/admin/achievements',
		{ preHandler: [validate(AchievementSchema.omit({ id: true }))] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const data = request.body as Record<string, unknown>;
			const adminId = request.admin!.adminId;

			const entry = await prisma.achievement.create({ data: data as any });

			await logAudit({
				adminId,
				action: 'create',
				resourceType: 'Achievement',
				resourceId: entry.id,
				changes: data as unknown as Prisma.InputJsonValue,
			});

			return reply.status(201).send(entry);
		},
	);

	// PUT /api/admin/achievements/:id
	fastify.put<{ Params: { id: string } }>(
		'/api/admin/achievements/:id',
		{ preHandler: [validate(AchievementUpdateSchema)] },
		async (request, reply) => {
			const { id } = request.params;
			const data = request.body as Record<string, unknown>;
			const adminId = request.admin!.adminId;

			const existing = await prisma.achievement.findUnique({ where: { id } });
			if (!existing) {
				const error = notFound('Achievement');
				return reply.status(error.statusCode).send(error.toJSON());
			}

			const entry = await prisma.achievement.update({
				where: { id },
				data: data as any,
			});

			await logAudit({
				adminId,
				action: 'update',
				resourceType: 'Achievement',
				resourceId: id,
				changes: data as unknown as Prisma.InputJsonValue,
			});

			return reply.send(entry);
		},
	);

	// PATCH /api/admin/achievements/reorder
	fastify.patch(
		'/api/admin/achievements/reorder',
		{ preHandler: [validate(ReorderSchema)] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const { items } = request.body as z.infer<typeof ReorderSchema>;
			const adminId = request.admin!.adminId;

			await prisma.$transaction(
				items.map(item =>
					prisma.achievement.update({
						where: { id: item.id },
						data: { order: item.order },
					}),
				),
			);

			await logAudit({
				adminId,
				action: 'update',
				resourceType: 'Achievement',
				resourceId: 'batch-reorder',
				changes: { items } as unknown as Prisma.InputJsonValue,
			});

			return reply.send({ message: 'Order updated' });
		},
	);

	// DELETE /api/admin/achievements/:id
	fastify.delete<{ Params: { id: string } }>(
		'/api/admin/achievements/:id',
		async (request, reply) => {
			const { id } = request.params;
			const adminId = request.admin!.adminId;

			const existing = await prisma.achievement.findUnique({ where: { id } });
			if (!existing) {
				const error = notFound('Achievement');
				return reply.status(error.statusCode).send(error.toJSON());
			}

			await prisma.achievement.delete({ where: { id } });

			await logAudit({
				adminId,
				action: 'delete',
				resourceType: 'Achievement',
				resourceId: id,
				changes: { title: existing.title },
			});

			return reply.send({ message: 'Achievement deleted' });
		},
	);
}
