import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { logAudit } from '../lib/audit';
import { uploadFile, deleteFile, buildDeleteTarget } from '../lib/cloudinary';
import type { IdRequest } from '../utils/types';

// List all achievements
async function listAchievements(_req: Request, res: Response): Promise<void> {
	const items = await prisma.achievement.findMany({
		orderBy: { order: 'asc' },
		include: { journeyEntry: { select: { id: true, title: true, type: true } } },
	});
	ApiResponse.ok(res, items);
}

// Create a new achievement
async function createAchievement(req: Request, res: Response): Promise<void> {
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

// Update an existing achievement
async function updateAchievement(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
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

// Reorder achievements
async function reorderAchievements(req: Request, res: Response): Promise<void> {
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

// Delete an achievement
async function deleteAchievement(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
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

// Upload achievement proof (replaces existing)
async function uploadAchievementProof(req: IdRequest, res: Response): Promise<void> {
	if (!req.file) throw ApiError.BadRequest('No file provided');
	const { id } = req.params;
	const adminId = req.admin!.adminId;

	const existing = await prisma.achievement.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Achievement');

	const result = await uploadFile(req.file, { folder: 'portfolio/achievements' });

	if (existing.proofUrl) {
		const target = buildDeleteTarget(existing.proofUrl);
		if (target) await deleteFile(target);
	}

	const entry = await prisma.achievement.update({
		where: { id },
		data: { proofUrl: result.url },
	});

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'Achievement',
		resourceId: id,
		changes: { proofUrl: result.url },
	});

	ApiResponse.ok(res, entry, 'Proof uploaded');
}

// Delete achievement proof
async function deleteAchievementProof(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const adminId = req.admin!.adminId;

	const existing = await prisma.achievement.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Achievement');
	if (!existing.proofUrl) throw ApiError.BadRequest('No proof file to delete');

	const target = buildDeleteTarget(existing.proofUrl);
	if (target) await deleteFile(target);

	const entry = await prisma.achievement.update({
		where: { id },
		data: { proofUrl: null },
	});

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'Achievement',
		resourceId: id,
		changes: { proofUrl: null },
	});

	ApiResponse.ok(res, entry, 'Proof deleted');
}

export {
	listAchievements,
	createAchievement,
	updateAchievement,
	reorderAchievements,
	deleteAchievement,
	uploadAchievementProof,
	deleteAchievementProof,
};
