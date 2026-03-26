import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { logAudit } from '../lib/audit';
import { uploadFile, deleteFile, deleteFiles, buildDeleteTarget } from '../lib/cloudinary';
import type { IdRequest } from '../utils/types';

// Controller functions for project management
async function listProjects(_req: Request, res: Response): Promise<void> {
	const projects = await prisma.project.findMany({
		orderBy: { order: 'asc' },
	});
	ApiResponse.ok(res, projects);
}

// Create a new project
async function createProject(req: Request, res: Response): Promise<void> {
	const data = req.body;
	const adminId = req.admin!.adminId;
	const project = await prisma.project.create({ data });

	await logAudit({
		adminId,
		action: 'create',
		resourceType: 'Project',
		resourceId: project.id,
		changes: data,
	});

	ApiResponse.created(res, project);
}

// Update an existing project
async function updateProject(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const data = req.body;
	const adminId = req.admin!.adminId;

	const existing = await prisma.project.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Project');

	const project = await prisma.project.update({ where: { id }, data });

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'Project',
		resourceId: id,
		changes: data,
	});

	ApiResponse.ok(res, project, 'Project updated');
}

// Update only the status of a project
async function updateProjectStatus(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const { status } = req.body;
	const adminId = req.admin!.adminId;

	const existing = await prisma.project.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Project');

	const project = await prisma.project.update({ where: { id }, data: { status } });

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'Project',
		resourceId: id,
		changes: { status, previousStatus: existing.status },
	});

	ApiResponse.ok(res, project, 'Status updated');
}

// Delete a project
async function deleteProject(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const adminId = req.admin!.adminId;

	const existing = await prisma.project.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Project');

	await prisma.project.delete({ where: { id } });

	await logAudit({
		adminId,
		action: 'delete',
		resourceType: 'Project',
		resourceId: id,
		changes: { title: existing.title },
	});

	ApiResponse.noContent(res);
}

// Upload project thumbnail (replaces existing)
async function uploadProjectThumbnail(req: IdRequest, res: Response): Promise<void> {
	if (!req.file) throw ApiError.BadRequest('No file provided');
	const { id } = req.params;
	const adminId = req.admin!.adminId;

	const existing = await prisma.project.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Project');

	const result = await uploadFile(req.file, { folder: 'portfolio/projects/thumbnails' });

	if (existing.thumbnail) {
		const target = buildDeleteTarget(existing.thumbnail);
		if (target) await deleteFile(target);
	}

	const project = await prisma.project.update({
		where: { id },
		data: { thumbnail: result.url },
	});

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'Project',
		resourceId: id,
		changes: { thumbnail: result.url },
	});

	ApiResponse.ok(res, project, 'Thumbnail uploaded');
}

// Append project images
async function uploadProjectImages(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const adminId = req.admin!.adminId;
	const files = req.files as Express.Multer.File[] | undefined;
	if (!files?.length) throw ApiError.BadRequest('No files provided');

	const existing = await prisma.project.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Project');

	const uploads = await Promise.all(
		files.map(file => uploadFile(file, { folder: 'portfolio/projects/images' })),
	);

	const newUrls = uploads.map(upload => upload.url);
	const project = await prisma.project.update({
		where: { id },
		data: { images: [...existing.images, ...newUrls] },
	});

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'Project',
		resourceId: id,
		changes: { imagesAdded: newUrls },
	});

	ApiResponse.ok(res, project, 'Images uploaded');
}

// Replace all project images
async function replaceProjectImages(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const adminId = req.admin!.adminId;
	const files = req.files as Express.Multer.File[] | undefined;
	if (!files?.length) throw ApiError.BadRequest('No files provided');

	const existing = await prisma.project.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Project');

	const uploads = await Promise.all(
		files.map(file => uploadFile(file, { folder: 'portfolio/projects/images' })),
	);
	const newUrls = uploads.map(upload => upload.url);

	const deleteTargets = existing.images
		.map(image => buildDeleteTarget(image))
		.filter((target): target is NonNullable<typeof target> => Boolean(target));
	if (deleteTargets.length) await deleteFiles(deleteTargets);

	const project = await prisma.project.update({
		where: { id },
		data: { images: newUrls },
	});

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'Project',
		resourceId: id,
		changes: { imagesReplaced: newUrls },
	});

	ApiResponse.ok(res, project, 'Images replaced');
}

// Delete selected project images
async function deleteProjectImages(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const { urls } = req.body as { urls: string[] };
	const adminId = req.admin!.adminId;

	const existing = await prisma.project.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Project');

	const toRemove = existing.images.filter(image => urls.includes(image));
	const remaining = existing.images.filter(image => !urls.includes(image));

	const deleteTargets = toRemove
		.map(image => buildDeleteTarget(image))
		.filter((target): target is NonNullable<typeof target> => Boolean(target));
	if (deleteTargets.length) await deleteFiles(deleteTargets);

	const project = await prisma.project.update({
		where: { id },
		data: { images: remaining },
	});

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'Project',
		resourceId: id,
		changes: { imagesRemoved: toRemove },
	});

	ApiResponse.ok(res, project, 'Images deleted');
}

// Bulk reorder projects
async function reorderProjects(req: Request, res: Response): Promise<void> {
	const { items } = req.body as { items: { id: string; order: number }[] };
	const adminId = req.admin!.adminId;

	if (!Array.isArray(items)) throw ApiError.BadRequest('Invalid payload format');

	await prisma.$transaction(
		items.map(item =>
			prisma.project.update({
				where: { id: item.id },
				data: { order: item.order },
			}),
		),
	);

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'Project',
		resourceId: 'bulk-reorder',
		changes: { reorderedParams: items.length },
	});

	ApiResponse.ok(res, null, 'Projects reordered successfully');
}

export {
	listProjects,
	createProject,
	updateProject,
	updateProjectStatus,
	deleteProject,
	uploadProjectThumbnail,
	uploadProjectImages,
	replaceProjectImages,
	deleteProjectImages,
	reorderProjects,
};
