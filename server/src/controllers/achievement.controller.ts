import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { logAudit } from '../lib/audit';

export async function listAchievements(_req: Request, res: Response): Promise<void> {
	const items = await prisma.achievement.findMany({
		orderBy: { order: 'asc' },
		include: { journeyEntry: { select: { id: true, title: true, type: true } } },
	});
	ApiResponse.ok(res, items);
}

export async function createAchievement(req: Request, res: Response): Promise<void> {
	const data = req.body;
	const adminId = req.admin!.adminId;

	const entry = await prisma.achievement.create({ data });

	await logAudit({
		adminId,
		action: 'create',
		resourceType: 'Achievement',
		resourceId: entry.id,
		changes: data,
	});

	ApiResponse.created(res, entry);
}

export async function updateAchievement(req: Request, res: Response): Promise<void> {
	const id = req.params.id as string;
	const data = req.body;
	const adminId = req.admin!.adminId;

	const existing = await prisma.achievement.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Achievement');

	const entry = await prisma.achievement.update({ where: { id }, data });

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'Achievement',
		resourceId: id,
		changes: data,
	});

	ApiResponse.ok(res, entry, 'Achievement updated');
}

export async function reorderAchievements(req: Request, res: Response): Promise<void> {
	const { items } = req.body;
	const adminId = req.admin!.adminId;

	await prisma.$transaction(
		items.map((item: { id: string; order: number }) =>
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
		changes: { items },
	});

	ApiResponse.ok(res, null, 'Order updated');
}

export async function deleteAchievement(req: Request, res: Response): Promise<void> {
	const id = req.params.id as string;
	const adminId = req.admin!.adminId;

	const existing = await prisma.achievement.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Achievement');

	await prisma.achievement.delete({ where: { id } });

	await logAudit({
		adminId,
		action: 'delete',
		resourceType: 'Achievement',
		resourceId: id,
		changes: { title: existing.title },
	});

	ApiResponse.noContent(res);
}
