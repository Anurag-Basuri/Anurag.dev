import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { logAudit } from '../lib/audit';
import { uploadFile, deleteFile, buildDeleteTarget } from '../lib/cloudinary';
import type { IdRequest } from '../utils/types';

// List all certifications
async function listCertifications(_req: Request, res: Response): Promise<void> {
	const items = await prisma.certification.findMany({
		orderBy: { order: 'asc' },
	});
	ApiResponse.ok(res, items);
}

// Create a new certification
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

// Update an existing certification
async function updateCertification(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
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

// Delete a certification
async function deleteCertification(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
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

// Upload certification file (replaces existing)
async function uploadCertificationFile(req: IdRequest, res: Response): Promise<void> {
	if (!req.file) throw ApiError.BadRequest('No file provided');
	const { id } = req.params;
	const adminId = req.admin!.adminId;

	const existing = await prisma.certification.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Certification');

	const result = await uploadFile(req.file, { folder: 'portfolio/certifications' });

	if (existing.certificateUrl) {
		const target = buildDeleteTarget(existing.certificateUrl);
		if (target) await deleteFile(target);
	}

	const cert = await prisma.certification.update({
		where: { id },
		data: { certificateUrl: result.url },
	});

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'Certification',
		resourceId: id,
		changes: { certificateUrl: result.url },
	});

	ApiResponse.ok(res, cert, 'Certificate uploaded');
}

// Delete certification file
async function deleteCertificationFile(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const adminId = req.admin!.adminId;

	const existing = await prisma.certification.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Certification');
	if (!existing.certificateUrl) throw ApiError.BadRequest('No certificate file to delete');

	const target = buildDeleteTarget(existing.certificateUrl);
	if (target) await deleteFile(target);

	const cert = await prisma.certification.update({
		where: { id },
		data: { certificateUrl: null },
	});

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'Certification',
		resourceId: id,
		changes: { certificateUrl: null },
	});

	ApiResponse.ok(res, cert, 'Certificate deleted');
}

// Bulk reorder certifications
async function reorderCertifications(req: Request, res: Response): Promise<void> {
	const { items } = req.body as { items: { id: string; order: number }[] };
	const adminId = req.admin!.adminId;

	if (!Array.isArray(items)) throw ApiError.BadRequest('Invalid payload format');

	await prisma.$transaction(
		items.map(item =>
			prisma.certification.update({
				where: { id: item.id },
				data: { order: item.order },
			}),
		),
	);

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'Certification',
		resourceId: 'bulk-reorder',
		changes: { reorderedParams: items.length },
	});

	ApiResponse.ok(res, null, 'Certifications reordered successfully');
}

export {
	listCertifications,
	createCertification,
	updateCertification,
	deleteCertification,
	uploadCertificationFile,
	deleteCertificationFile,
	reorderCertifications,
};
