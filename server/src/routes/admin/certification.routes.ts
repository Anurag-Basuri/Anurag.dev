import { Router, Request } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { validate } from '../../middleware/validate.middleware';
import { logAudit } from '../../lib/audit';
import { notFound } from '../../lib/errors';
import { CertificationSchema } from '../../schemas/zod-schemas';
import { asyncHandler } from '../../utils/asyncHandler';

const CertificationUpdateSchema = CertificationSchema.partial().omit({ id: true });

const router = Router();

// GET /api/admin/certifications
router.get(
	'/api/admin/certifications',
	asyncHandler(async (_req, res) => {
		const items = await prisma.certification.findMany({
			orderBy: { startDate: 'desc' },
		});
		res.json({ items });
	}),
);

// POST /api/admin/certifications
router.post(
	'/api/admin/certifications',
	validate(CertificationSchema.omit({ id: true })),
	asyncHandler(async (req, res) => {
		const data = req.body as Record<string, unknown>;
		const adminId = req.admin!.adminId;

		const cert = await prisma.certification.create({ data: data as any });

		await logAudit({
			adminId,
			action: 'create',
			resourceType: 'Certification',
			resourceId: cert.id,
			changes: data as unknown as Prisma.InputJsonValue,
		});

		res.status(201).json(cert);
	}),
);

// PUT /api/admin/certifications/:id
router.put(
	'/api/admin/certifications/:id',
	validate(CertificationUpdateSchema),
	asyncHandler(async (req: Request<{ id: string }>, res) => {
		const { id } = req.params;
		const data = req.body as Record<string, unknown>;
		const adminId = req.admin!.adminId;

		const existing = await prisma.certification.findUnique({ where: { id } });
		if (!existing) throw notFound('Certification');

		const cert = await prisma.certification.update({
			where: { id },
			data: data as any,
		});

		await logAudit({
			adminId,
			action: 'update',
			resourceType: 'Certification',
			resourceId: id,
			changes: data as unknown as Prisma.InputJsonValue,
		});

		res.json(cert);
	}),
);

// DELETE /api/admin/certifications/:id
router.delete(
	'/api/admin/certifications/:id',
	asyncHandler(async (req: Request<{ id: string }>, res) => {
		const { id } = req.params;
		const adminId = req.admin!.adminId;

		const existing = await prisma.certification.findUnique({ where: { id } });
		if (!existing) throw notFound('Certification');

		await prisma.certification.delete({ where: { id } });

		await logAudit({
			adminId,
			action: 'delete',
			resourceType: 'Certification',
			resourceId: id,
			changes: { title: existing.title },
		});

		res.json({ message: 'Certification deleted' });
	}),
);

export default router;
