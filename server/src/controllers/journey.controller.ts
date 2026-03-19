import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { logAudit } from '../lib/audit';
import { uploadFile, deleteFile, deleteFiles, buildDeleteTarget } from '../lib/cloudinary';
import type { IdRequest } from '../utils/types';

// Controller for managing the user journey entries
async function listJourney(_req: Request, res: Response): Promise<void> {
	const items = await prisma.journeyEntry.findMany({
		orderBy: { order: 'asc' },
		include: {
			achievements: { orderBy: { order: 'asc' } },
		},
	});

	const entryIds = items.map(item => item.id);
	const documents = entryIds.length
		? await prisma.journeyDocument.findMany({
				where: { journeyEntryId: { in: entryIds } },
				orderBy: { createdAt: 'desc' },
			})
		: [];

	const docsByEntry = new Map<string, typeof documents>();
	for (const doc of documents) {
		const bucket = docsByEntry.get(doc.journeyEntryId) ?? [];
		bucket.push(doc);
		docsByEntry.set(doc.journeyEntryId, bucket);
	}

	const withDocuments = items.map(item => ({
		...item,
		documents: docsByEntry.get(item.id) ?? [],
	}));

	ApiResponse.ok(res, withDocuments);
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

	const documents = await prisma.journeyDocument.findMany({ where: { journeyEntryId: id } });
	const deleteTargets = documents
		.map((doc: { url: string }) => buildDeleteTarget(doc.url))
		.filter(
			(
				target: ReturnType<typeof buildDeleteTarget>,
			): target is NonNullable<ReturnType<typeof buildDeleteTarget>> => Boolean(target),
		);
	if (deleteTargets.length) await deleteFiles(deleteTargets);

	await prisma.journeyEntry.delete({ where: { id } });

	await logAudit({
		adminId,
		action: 'delete',
		resourceType: 'JourneyEntry',
		resourceId: id,
		changes: { title: existing.title, documentsDeleted: documents.length },
	});

	ApiResponse.noContent(res);
}

// List documents for a journey entry
async function listJourneyDocuments(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const existing = await prisma.journeyEntry.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Journey entry');

	const docs = await prisma.journeyDocument.findMany({
		where: { journeyEntryId: id },
		orderBy: { createdAt: 'desc' },
	});

	ApiResponse.ok(res, docs);
}

// Create a journey document (with upload)
async function createJourneyDocument(req: IdRequest, res: Response): Promise<void> {
	if (!req.file) throw ApiError.BadRequest('No file provided');
	const { id } = req.params;
	const adminId = req.admin!.adminId;
	const { title, type, issuer, issuedAt, notes } = req.body;

	const existing = await prisma.journeyEntry.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Journey entry');

	const result = await uploadFile(req.file, { folder: 'portfolio/journey/documents' });

	const doc = await prisma.journeyDocument.create({
		data: {
			journeyEntryId: id,
			title,
			type,
			url: result.url,
			issuer,
			issuedAt,
			notes,
		},
	});

	await logAudit({
		adminId,
		action: 'create',
		resourceType: 'JourneyDocument',
		resourceId: doc.id,
		changes: { journeyEntryId: id, title, type },
	});

	ApiResponse.created(res, doc);
}

// Update a journey document (optional upload)
async function updateJourneyDocument(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const adminId = req.admin!.adminId;
	const { title, type, issuer, issuedAt, notes } = req.body;

	const existing = await prisma.journeyDocument.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Journey document');

	let url: string | undefined;
	if (req.file) {
		const result = await uploadFile(req.file, { folder: 'portfolio/journey/documents' });
		url = result.url;
		const target = buildDeleteTarget(existing.url);
		if (target) await deleteFile(target);
	}

	const doc = await prisma.journeyDocument.update({
		where: { id },
		data: {
			...(title !== undefined && { title }),
			...(type !== undefined && { type }),
			...(issuer !== undefined && { issuer }),
			...(issuedAt !== undefined && { issuedAt }),
			...(notes !== undefined && { notes }),
			...(url && { url }),
		},
	});

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'JourneyDocument',
		resourceId: id,
		changes: { title, type, issuer, issuedAt, notes, ...(url && { url }) },
	});

	ApiResponse.ok(res, doc, 'Journey document updated');
}

// Delete a journey document
async function deleteJourneyDocument(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const adminId = req.admin!.adminId;

	const existing = await prisma.journeyDocument.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Journey document');

	const target = buildDeleteTarget(existing.url);
	if (target) await deleteFile(target);

	await prisma.journeyDocument.delete({ where: { id } });

	await logAudit({
		adminId,
		action: 'delete',
		resourceType: 'JourneyDocument',
		resourceId: id,
		changes: { title: existing.title },
	});

	ApiResponse.noContent(res);
}

export {
	listJourney,
	createJourney,
	updateJourney,
	reorderJourney,
	deleteJourney,
	listJourneyDocuments,
	createJourneyDocument,
	updateJourneyDocument,
	deleteJourneyDocument,
};
