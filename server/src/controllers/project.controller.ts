import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiResponse } from '../utils/ApiResponse';
import { logAudit } from '../lib/audit';
import { notFound, conflict } from '../lib/errors';

/**
 * GET /api/admin/projects
 */
export async function listProjects(_req: Request, res: Response): Promise<void> {
	const projects = await prisma.project.findMany({
		orderBy: { createdAt: 'desc' },
	});
	ApiResponse.ok(res, projects);
}

/**
 * POST /api/admin/projects
 */
export async function createProject(req: Request, res: Response): Promise<void> {
	const data = req.body;
	const adminId = req.admin!.adminId;

	const existing = await prisma.project.findUnique({ where: { slug: data.slug } });
	if (existing) throw conflict(`Project with slug "${data.slug}" already exists`);

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

/**
 * PUT /api/admin/projects/:id
 */
export async function updateProject(req: Request, res: Response): Promise<void> {
	const { id } = req.params;
	const data = req.body;
	const adminId = req.admin!.adminId;

	const existing = await prisma.project.findUnique({ where: { id } });
	if (!existing) throw notFound('Project');

	if (data.slug && data.slug !== existing.slug) {
		const slugExists = await prisma.project.findUnique({ where: { slug: data.slug } });
		if (slugExists) throw conflict(`Project with slug "${data.slug}" already exists`);
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

/**
 * PATCH /api/admin/projects/:id/status
 */
export async function updateProjectStatus(req: Request, res: Response): Promise<void> {
	const { id } = req.params;
	const { status } = req.body;
	const adminId = req.admin!.adminId;

	const existing = await prisma.project.findUnique({ where: { id } });
	if (!existing) throw notFound('Project');

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

/**
 * DELETE /api/admin/projects/:id
 */
export async function deleteProject(req: Request, res: Response): Promise<void> {
	const { id } = req.params;
	const adminId = req.admin!.adminId;

	const existing = await prisma.project.findUnique({ where: { id } });
	if (!existing) throw notFound('Project');

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
