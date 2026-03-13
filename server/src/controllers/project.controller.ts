import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { logAudit } from '../lib/audit';

// Controller functions for project management
async function listProjects(_req: Request, res: Response): Promise<void> {
	const projects = await prisma.project.findMany({
		orderBy: { createdAt: 'desc' },
	});
	ApiResponse.ok(res, projects);
}

// Create a new project
async function createProject(req: Request, res: Response): Promise<void> {
	const data = req.body;
	const adminId = req.admin!.adminId;

	const existing = await prisma.project.findUnique({ where: { slug: data.slug } });
	if (existing) throw ApiError.Conflict(`Project with slug "${data.slug}" already exists`);

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
async function updateProject(req: Request, res: Response): Promise<void> {
	const id = req.params.id as string;
	const data = req.body;
	const adminId = req.admin!.adminId;

	const existing = await prisma.project.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Project');

	if (data.slug && data.slug !== existing.slug) {
		const slugExists = await prisma.project.findUnique({ where: { slug: data.slug } });
		if (slugExists) throw ApiError.Conflict(`Project with slug "${data.slug}" already exists`);
	}

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
async function updateProjectStatus(req: Request, res: Response): Promise<void> {
	const id = req.params.id as string;
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
async function deleteProject(req: Request, res: Response): Promise<void> {
	const id = req.params.id as string;
	const adminId = req.admin!.adminId;

	const existing = await prisma.project.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Project');

	await prisma.project.delete({ where: { id } });

	await logAudit({
		adminId,
		action: 'delete',
		resourceType: 'Project',
		resourceId: id,
		changes: { title: existing.title, slug: existing.slug },
	});

	ApiResponse.noContent(res);
}

export { listProjects, createProject, updateProject, updateProjectStatus, deleteProject };
