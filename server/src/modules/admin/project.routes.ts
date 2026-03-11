import { Router, Request } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/prisma';
import { validate } from '../../middleware/validate.middleware';
import { logAudit } from '../../lib/audit';
import { notFound, conflict } from '../../lib/errors';
import { ProjectSchema } from '../../schemas/zod-schemas';
import { asyncHandler } from '../../utils/asyncHandler';

const ProjectUpdateSchema = ProjectSchema.partial().omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

const StatusSchema = z.object({
	status: z.enum(['draft', 'published', 'archived', 'completed']),
});

const router = Router();

// GET /api/admin/projects
router.get(
	'/api/admin/projects',
	asyncHandler(async (_req, res) => {
		const projects = await prisma.project.findMany({
			orderBy: { createdAt: 'desc' },
		});
		res.json({ items: projects });
	}),
);

// POST /api/admin/projects
router.post(
	'/api/admin/projects',
	validate(ProjectSchema.omit({ id: true, createdAt: true, updatedAt: true })),
	asyncHandler(async (req, res) => {
		const data = req.body as z.infer<typeof ProjectSchema>;
		const adminId = req.admin!.adminId;

		const existing = await prisma.project.findUnique({ where: { slug: data.slug } });
		if (existing) throw conflict(`Project with slug "${data.slug}" already exists`);

		const project = await prisma.project.create({ data: data as any });

		await logAudit({
			adminId,
			action: 'create',
			resourceType: 'Project',
			resourceId: project.id,
			changes: data as unknown as Prisma.InputJsonValue,
		});

		res.status(201).json(project);
	}),
);

// PUT /api/admin/projects/:id
router.put(
	'/api/admin/projects/:id',
	validate(ProjectUpdateSchema),
	asyncHandler(async (req: Request<{ id: string }>, res) => {
		const { id } = req.params;
		const data = req.body as Record<string, unknown>;
		const adminId = req.admin!.adminId;

		const existing = await prisma.project.findUnique({ where: { id } });
		if (!existing) throw notFound('Project');

		if (data.slug && data.slug !== existing.slug) {
			const slugExists = await prisma.project.findUnique({
				where: { slug: data.slug as string },
			});
			if (slugExists) throw conflict(`Project with slug "${data.slug}" already exists`);
		}

		const project = await prisma.project.update({
			where: { id },
			data: data as any,
		});

		await logAudit({
			adminId,
			action: 'update',
			resourceType: 'Project',
			resourceId: id,
			changes: data as unknown as Prisma.InputJsonValue,
		});

		res.json(project);
	}),
);

// PATCH /api/admin/projects/:id/status
router.patch(
	'/api/admin/projects/:id/status',
	validate(StatusSchema),
	asyncHandler(async (req: Request<{ id: string }>, res) => {
		const { id } = req.params;
		const { status } = req.body as z.infer<typeof StatusSchema>;
		const adminId = req.admin!.adminId;

		const existing = await prisma.project.findUnique({ where: { id } });
		if (!existing) throw notFound('Project');

		const project = await prisma.project.update({
			where: { id },
			data: { status },
		});

		await logAudit({
			adminId,
			action: 'update',
			resourceType: 'Project',
			resourceId: id,
			changes: { status, previousStatus: existing.status },
		});

		res.json(project);
	}),
);

// DELETE /api/admin/projects/:id
router.delete(
	'/api/admin/projects/:id',
	asyncHandler(async (req: Request<{ id: string }>, res) => {
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

		res.json({ message: 'Project deleted' });
	}),
);

export default router;
