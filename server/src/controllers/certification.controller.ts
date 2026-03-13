import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { logAudit } from '../lib/audit';

// Controllers to get all the certifications
async function listCertifications(_req: Request, res: Response): Promise<void> {
	const items = await prisma.certification.findMany({
		orderBy: { startDate: 'desc' },
	});
	ApiResponse.ok(res, items);
}

// Controller to create a new certification
async function createCertification(req: Request, res: Response): Promise<void> {
	const data = req.body;
	const adminId = req.admin!.adminId;

	const cert = await prisma.certification.create({ data });

	await logAudit({
		adminId,
		action: 'create',
		resourceType: 'Certification',
		resourceId: cert.id,
		changes: data,
	});

	ApiResponse.created(res, cert);
}

// Controller to update an existing certification
async function updateCertification(req: Request, res: Response): Promise<void> {
	const id = req.params.id as string;
	const data = req.body;
	const adminId = req.admin!.adminId;

	const existing = await prisma.certification.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Certification');

	const cert = await prisma.certification.update({ where: { id }, data });

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'Certification',
		resourceId: id,
		changes: data,
	});

	ApiResponse.ok(res, cert, 'Certification updated');
}

// Controller to delete a certification
async function deleteCertification(req: Request, res: Response): Promise<void> {
	const id = req.params.id as string;
	const adminId = req.admin!.adminId;

	const existing = await prisma.certification.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Certification');

	await prisma.certification.delete({ where: { id } });

	await logAudit({
		adminId,
		action: 'delete',
		resourceType: 'Certification',
		resourceId: id,
		changes: { title: existing.title },
	});

	ApiResponse.noContent(res);
}

export { listCertifications, createCertification, updateCertification, deleteCertification };
