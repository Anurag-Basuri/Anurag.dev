import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiResponse } from '../utils/ApiResponse';
import { logAudit } from '../lib/audit';

const SINGLETON_ID = 'main';

/**
 * GET /api/admin/profile
 */
export async function getProfile(_req: Request, res: Response): Promise<void> {
	const profile = await prisma.profile.findUnique({ where: { id: SINGLETON_ID } });
	ApiResponse.ok(res, profile ?? null);
}

/**
 * PUT /api/admin/profile
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
	const data = req.body;
	const adminId = req.admin!.adminId;

	const profile = await prisma.profile.upsert({
		where: { id: SINGLETON_ID },
		create: { id: SINGLETON_ID, ...data },
		update: data,
	});

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'Profile',
		resourceId: SINGLETON_ID,
		changes: data,
	});

	ApiResponse.ok(res, profile, 'Profile updated');
}
