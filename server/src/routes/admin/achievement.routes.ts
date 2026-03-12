import { Router, Request } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { validate } from '../../middleware/validate.middleware';
import { logAudit } from '../../lib/audit';
import { notFound } from '../../lib/errors';
import { AchievementSchema } from '../../schemas/zod-schemas';
import { asyncHandler } from '../../utils/asyncHandler';

const AchievementUpdateSchema = AchievementSchema.partial().omit({ id: true });

const ReorderSchema = z.object({
	items: z.array(
		z.object({
			id: z.string(),
			order: z.number().int().min(0),
		}),
	),
});

const router = Router();

// GET /api/admin/achievements
router.get(
	'/api/admin/achievements',
	asyncHandler(async (_req, res) => {
		const items = await (prisma as any).achievement.findMany({
			orderBy: { order: 'asc' },
			include: { journeyEntry: { select: { id: true, title: true, type: true } } },
		});
		res.json({ items });
	}),
);

// POST /api/admin/achievements
router.post(
	'/api/admin/achievements',
	validate(AchievementSchema.omit({ id: true })),
	asyncHandler(async (req, res) => {
		const data = req.body as Record<string, unknown>;
		const adminId = req.admin!.adminId;

		const entry = await (prisma as any).achievement.create({ data: data as any });

		await logAudit({
			adminId,
			action: 'create',
			resourceType: 'Achievement',
			resourceId: entry.id,
			changes: data as unknown as Prisma.InputJsonValue,
		});

		res.status(201).json(entry);
	}),
);

// PUT /api/admin/achievements/:id
router.put(
	'/api/admin/achievements/:id',
	validate(AchievementUpdateSchema),
	asyncHandler(async (req: Request<{ id: string }>, res) => {
		const { id } = req.params;
		const data = req.body as Record<string, unknown>;
		const adminId = req.admin!.adminId;

		const existing = await (prisma as any).achievement.findUnique({ where: { id } });
		if (!existing) throw notFound('Achievement');

		const entry = await (prisma as any).achievement.update({
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

		res.json(entry);
	}),
);

// PATCH /api/admin/achievements/reorder
router.patch(
	'/api/admin/achievements/reorder',
	validate(ReorderSchema),
	asyncHandler(async (req, res) => {
		const { items } = req.body as z.infer<typeof ReorderSchema>;
		const adminId = req.admin!.adminId;

		await prisma.$transaction(
			items.map(item =>
				(prisma as any).achievement.update({
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

		res.json({ message: 'Order updated' });
	}),
);

// DELETE /api/admin/achievements/:id
router.delete(
	'/api/admin/achievements/:id',
	asyncHandler(async (req: Request<{ id: string }>, res) => {
		const { id } = req.params;
		const adminId = req.admin!.adminId;

		const existing = await (prisma as any).achievement.findUnique({ where: { id } });
		if (!existing) throw notFound('Achievement');

		await (prisma as any).achievement.delete({ where: { id } });

		await logAudit({
			adminId,
			action: 'delete',
			resourceType: 'Achievement',
			resourceId: id,
			changes: { title: existing.title },
		});

		res.json({ message: 'Achievement deleted' });
	}),
);

export default router;
