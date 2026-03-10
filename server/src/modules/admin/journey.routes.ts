import { Router, Request } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { validate } from '../../middleware/validate';
import { logAudit } from '../../lib/audit';
import { notFound } from '../../lib/errors';
import { JourneyItemSchema } from '../../schemas/zod-schemas';
import { asyncHandler } from '../../utils/asyncHandler';

const JourneyUpdateSchema = JourneyItemSchema.partial().omit({ id: true });

const ReorderSchema = z.object({
	items: z.array(
		z.object({
			id: z.string(),
			order: z.number().int().min(0),
		}),
	),
});

const router = Router();

// GET /api/admin/journey
router.get(
	'/api/admin/journey',
	asyncHandler(async (_req, res) => {
		const items = await prisma.journeyEntry.findMany({
			orderBy: { order: 'asc' },
		});
		res.json({ items });
	}),
);

// POST /api/admin/journey
router.post(
	'/api/admin/journey',
	validate(JourneyItemSchema.omit({ id: true })),
	asyncHandler(async (req, res) => {
		const data = req.body as Record<string, unknown>;
		const adminId = req.admin!.adminId;

		const entry = await prisma.journeyEntry.create({ data: data as any });

		await logAudit({
			adminId,
			action: 'create',
			resourceType: 'JourneyEntry',
			resourceId: entry.id,
			changes: data as unknown as Prisma.InputJsonValue,
		});

		res.status(201).json(entry);
	}),
);

// PUT /api/admin/journey/:id
router.put(
	'/api/admin/journey/:id',
	validate(JourneyUpdateSchema),
	asyncHandler(async (req: Request<{ id: string }>, res) => {
		const { id } = req.params;
		const data = req.body as Record<string, unknown>;
		const adminId = req.admin!.adminId;

		const existing = await prisma.journeyEntry.findUnique({ where: { id } });
		if (!existing) throw notFound('Journey entry');

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

		res.json(entry);
	}),
);

// PATCH /api/admin/journey/reorder
router.patch(
	'/api/admin/journey/reorder',
	validate(ReorderSchema),
	asyncHandler(async (req, res) => {
		const { items } = req.body as z.infer<typeof ReorderSchema>;
		const adminId = req.admin!.adminId;

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

		res.json({ message: 'Order updated' });
	}),
);

// DELETE /api/admin/journey/:id
router.delete(
	'/api/admin/journey/:id',
	asyncHandler(async (req: Request<{ id: string }>, res) => {
		const { id } = req.params;
		const adminId = req.admin!.adminId;

		const existing = await prisma.journeyEntry.findUnique({ where: { id } });
		if (!existing) throw notFound('Journey entry');

		await prisma.journeyEntry.delete({ where: { id } });

		await logAudit({
			adminId,
			action: 'delete',
			resourceType: 'JourneyEntry',
			resourceId: id,
			changes: { title: existing.title },
		});

		res.json({ message: 'Journey entry deleted' });
	}),
);

export default router;
