import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/db';
import { validate } from '../../middleware/validate';
import { logAudit } from '../../lib/audit';
import { ProfileSchema } from '../../schemas/zod-schemas';
import { asyncHandler } from '../../utils/asyncHandler';

const router = Router();
const SINGLETON_ID = 'main';

// GET /api/admin/profile
router.get(
	'/api/admin/profile',
	asyncHandler(async (_req, res) => {
		const profile = await prisma.profile.findUnique({ where: { id: SINGLETON_ID } });
		res.json(profile ?? null);
	}),
);

// PUT /api/admin/profile
router.put(
	'/api/admin/profile',
	validate(ProfileSchema),
	asyncHandler(async (req, res) => {
		const data = req.body as Record<string, unknown>;
		const adminId = req.admin!.adminId;

		const profile = await prisma.profile.upsert({
			where: { id: SINGLETON_ID },
			create: { id: SINGLETON_ID, ...(data as any) },
			update: data as any,
		});

		await logAudit({
			adminId,
			action: 'update',
			resourceType: 'Profile',
			resourceId: SINGLETON_ID,
			changes: data as unknown as Prisma.InputJsonValue,
		});

		res.json(profile);
	}),
);

export default router;
