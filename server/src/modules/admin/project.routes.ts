import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/db';
import { validate } from '../../middleware/validate';
import { logAudit } from '../../lib/audit';
import { notFound, conflict } from '../../lib/errors';
import { ProjectSchema } from '../../schemas/zod-schemas';

const ProjectUpdateSchema = ProjectSchema.partial().omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

const StatusSchema = z.object({
	status: z.enum(['draft', 'published', 'archived', 'completed']),
});

export default async function projectRoutes(fastify: FastifyInstance) {
	// GET /api/admin/projects — list ALL (including drafts)
	fastify.get('/api/admin/projects', async (_req, reply) => {
		const projects = await prisma.project.findMany({
			orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
		});
		return reply.send({ items: projects });
	});

	// POST /api/admin/projects — create
	fastify.post(
		'/api/admin/projects',
		{
			preHandler: [
				validate(ProjectSchema.omit({ id: true, createdAt: true, updatedAt: true })),
			],
		},
		async (request: FastifyRequest, reply: FastifyReply) => {
			const data = request.body as z.infer<typeof ProjectSchema>;
			const adminId = request.admin!.adminId;

			const existing = await prisma.project.findUnique({
				where: { slug: data.slug },
			});
			if (existing) {
				const error = conflict(`Project with slug "${data.slug}" already exists`);
				return reply.status(error.statusCode).send(error.toJSON());
			}

			const project = await prisma.project.create({ data: data as any });

			await logAudit({
				adminId,
				action: 'create',
				resourceType: 'Project',
				resourceId: project.id,
				changes: data as unknown as Prisma.InputJsonValue,
			});

			return reply.status(201).send(project);
		},
	);

	// PUT /api/admin/projects/:id — update
	fastify.put<{ Params: { id: string } }>(
		'/api/admin/projects/:id',
		{ preHandler: [validate(ProjectUpdateSchema)] },
		async (request, reply) => {
			const { id } = request.params;
			const data = request.body as Record<string, unknown>;
			const adminId = request.admin!.adminId;

			const existing = await prisma.project.findUnique({ where: { id } });
			if (!existing) {
				const error = notFound('Project');
				return reply.status(error.statusCode).send(error.toJSON());
			}

			if (data.slug && data.slug !== existing.slug) {
				const slugExists = await prisma.project.findUnique({
					where: { slug: data.slug as string },
				});
				if (slugExists) {
					const error = conflict(`Project with slug "${data.slug}" already exists`);
					return reply.status(error.statusCode).send(error.toJSON());
				}
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

			return reply.send(project);
		},
	);

	// PATCH /api/admin/projects/:id/status — change status
	fastify.patch<{ Params: { id: string } }>(
		'/api/admin/projects/:id/status',
		{ preHandler: [validate(StatusSchema)] },
		async (request, reply) => {
			const { id } = request.params;
			const { status } = request.body as z.infer<typeof StatusSchema>;
			const adminId = request.admin!.adminId;

			const existing = await prisma.project.findUnique({ where: { id } });
			if (!existing) {
				const error = notFound('Project');
				return reply.status(error.statusCode).send(error.toJSON());
			}

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

			return reply.send(project);
		},
	);

	// DELETE /api/admin/projects/:id
	fastify.delete<{ Params: { id: string } }>(
		'/api/admin/projects/:id',
		async (request, reply) => {
			const { id } = request.params;
			const adminId = request.admin!.adminId;

			const existing = await prisma.project.findUnique({ where: { id } });
			if (!existing) {
				const error = notFound('Project');
				return reply.status(error.statusCode).send(error.toJSON());
			}

			await prisma.project.delete({ where: { id } });

			await logAudit({
				adminId,
				action: 'delete',
				resourceType: 'Project',
				resourceId: id,
				changes: { title: existing.title, slug: existing.slug },
			});

			return reply.send({ message: 'Project deleted' });
		},
	);
}
