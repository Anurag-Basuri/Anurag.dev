import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiResponse } from '../utils/ApiResponse';
import { logAudit } from '../lib/audit';
import { notFound } from '../lib/errors';

/**
 * GET /api/admin/journey
 */
export async function listJourney(_req: Request, res: Response): Promise<void> {
	const items = await prisma.journeyEntry.findMany({
		orderBy: { order: 'asc' },
	});
	ApiResponse.ok(res, items);
}

/**
 * POST /api/admin/journey
 */
export async function createJourney(req: Request, res: Response): Promise<void> {
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

/**
 * PUT /api/admin/journey/:id
 */
export async function updateJourney(req: Request, res: Response): Promise<void> {
	const id = req.params.id as string;
	const data = req.body;
	const adminId = req.admin!.adminId;

	const existing = await prisma.journeyEntry.findUnique({ where: { id } });
	if (!existing) throw notFound('Journey entry');

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

/**
 * PATCH /api/admin/journey/reorder
 */
export async function reorderJourney(req: Request, res: Response): Promise<void> {
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

/**
 * DELETE /api/admin/journey/:id
 */
export async function deleteJourney(req: Request, res: Response): Promise<void> {
	const id = req.params.id as string;
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

	ApiResponse.noContent(res);
}
