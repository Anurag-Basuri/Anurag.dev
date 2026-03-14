import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { logAudit } from '../lib/audit';
import type { IdRequest } from '../utils/types';

// Controller for managing the user journey entries
async function listJourney(_req: Request, res: Response): Promise<void> {
	const items = await prisma.journeyEntry.findMany({
		orderBy: { order: 'asc' },
	});
	ApiResponse.ok(res, items);
}

// Admin creates a new journey entry
async function createJourney(req: Request, res: Response): Promise<void> {
	const data = req.body;
	const adminId = req.admin!.adminId;

	const entry = await prisma.journeyEntry.create({ data });

	await logAudit({
		adminId,
		action: 'create',
		resourceType: 'JourneyEntry',
		resourceId: entry.id,
		changes: data,
	});

	ApiResponse.created(res, entry);
}

// Admin updates an existing journey entry
async function updateJourney(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const data = req.body;
	const adminId = req.admin!.adminId;

	const existing = await prisma.journeyEntry.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Journey entry');

	const entry = await prisma.journeyEntry.update({ where: { id }, data });

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'JourneyEntry',
		resourceId: id,
		changes: data,
	});

	ApiResponse.ok(res, entry, 'Journey entry updated');
}

// Admin reorders journey entries
async function reorderJourney(req: Request, res: Response): Promise<void> {
	const { items } = req.body;
	const adminId = req.admin!.adminId;

	await prisma.$transaction(
		items.map((item: { id: string; order: number }) =>
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
		changes: { items },
	});

	ApiResponse.ok(res, null, 'Order updated');
}

// Admin deletes a journey entry
async function deleteJourney(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const adminId = req.admin!.adminId;

	const existing = await prisma.journeyEntry.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Journey entry');

	await prisma.journeyEntry.delete({ where: { id } });

	await logAudit({
		adminId,
		action: 'delete',
		resourceType: 'JourneyEntry',
		resourceId: id,
		changes: { title: existing.title },
	});

	ApiResponse.noContent(res);
}

export { listJourney, createJourney, updateJourney, reorderJourney, deleteJourney };
