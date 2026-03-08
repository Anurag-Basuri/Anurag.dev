import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/db';
import { validate } from '../../middleware/validate';
import { logAudit } from '../../lib/audit';
import { notFound } from '../../lib/errors';
import { JourneyItemSchema } from '../../schemas/zod-schemas';

const JourneyUpdateSchema = JourneyItemSchema.partial().omit({ id: true });

const ReorderSchema = z.object({
	items: z.array(
		z.object({
			id: z.string(),
			order: z.number().int().min(0),
		}),
	),
});

export default async function journeyRoutes(fastify: FastifyInstance) {
	// GET /api/admin/journey
	fastify.get('/api/admin/journey', async (_req, reply) => {
		const items = await prisma.journeyEntry.findMany({
			orderBy: { order: 'asc' },
		});
		return reply.send({ items });
	});

	// POST /api/admin/journey
	fastify.post(
		'/api/admin/journey',
		{ preHandler: [validate(JourneyItemSchema.omit({ id: true }))] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const data = request.body as Record<string, unknown>;
			const adminId = request.admin!.adminId;

			const entry = await prisma.journeyEntry.create({ data: data as any });

			await logAudit({
				adminId,
				action: 'create',
				resourceType: 'JourneyEntry',
				resourceId: entry.id,
				changes: data as unknown as Prisma.InputJsonValue,
			});

			return reply.status(201).send(entry);
		},
	);

	// PUT /api/admin/journey/:id
	fastify.put<{ Params: { id: string } }>(
		'/api/admin/journey/:id',
		{ preHandler: [validate(JourneyUpdateSchema)] },
		async (request, reply) => {
			const { id } = request.params;
			const data = request.body as Record<string, unknown>;
			const adminId = request.admin!.adminId;

			const existing = await prisma.journeyEntry.findUnique({ where: { id } });
			if (!existing) {
				const error = notFound('Journey entry');
				return reply.status(error.statusCode).send(error.toJSON());
			}

			const entry = await prisma.journeyEntry.update({
				where: { id },
				data: data as any,
			});

			await logAudit({
				adminId,
				action: 'update',
				resourceType: 'JourneyEntry',
				resourceId: id,
				changes: data as unknown as Prisma.InputJsonValue,
			});

			return reply.send(entry);
		},
	);

	// PATCH /api/admin/journey/reorder
	fastify.patch(
		'/api/admin/journey/reorder',
		{ preHandler: [validate(ReorderSchema)] },
		async (request: FastifyRequest, reply: FastifyReply) => {
			const { items } = request.body as z.infer<typeof ReorderSchema>;
			const adminId = request.admin!.adminId;

			await prisma.$transaction(
				items.map(item =>
					prisma.journeyEntry.update({
						where: { id: item.id },
						data: { order: item.order },
					}),
				),
			);

			await logAudit({
				adminId,
				action: 'update',
				resourceType: 'JourneyEntry',
				resourceId: 'batch-reorder',
				changes: { items } as unknown as Prisma.InputJsonValue,
			});

			return reply.send({ message: 'Order updated' });
		},
	);

	// DELETE /api/admin/journey/:id
	fastify.delete<{ Params: { id: string } }>('/api/admin/journey/:id', async (request, reply) => {
		const { id } = request.params;
		const adminId = request.admin!.adminId;

		const existing = await prisma.journeyEntry.findUnique({ where: { id } });
		if (!existing) {
			const error = notFound('Journey entry');
			return reply.status(error.statusCode).send(error.toJSON());
		}

		await prisma.journeyEntry.delete({ where: { id } });

		await logAudit({
			adminId,
			action: 'delete',
			resourceType: 'JourneyEntry',
			resourceId: id,
			changes: { title: existing.title },
		});

		return reply.send({ message: 'Journey entry deleted' });
	});
}
