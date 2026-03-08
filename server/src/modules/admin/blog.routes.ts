import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/db';
import { validate } from '../../middleware/validate';
import { logAudit } from '../../lib/audit';
import { notFound, conflict } from '../../lib/errors';
import { BlogPostSchema } from '../../schemas/zod-schemas';

const BlogUpdateSchema = BlogPostSchema.partial().omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

const BlogStatusSchema = z.object({
	status: z.enum(['draft', 'published', 'archived']),
});

export default async function blogRoutes(fastify: FastifyInstance) {
	// GET /api/admin/blog — list ALL (including drafts)
	fastify.get('/api/admin/blog', async (_req, reply) => {
		const posts = await prisma.blogPost.findMany({
			orderBy: { createdAt: 'desc' },
		});
		return reply.send({ posts });
	});

	// POST /api/admin/blog
	fastify.post(
		'/api/admin/blog',
		{
			preHandler: [
				validate(BlogPostSchema.omit({ id: true, createdAt: true, updatedAt: true })),
			],
		},
		async (request: FastifyRequest, reply: FastifyReply) => {
			const data = request.body as z.infer<typeof BlogPostSchema>;
			const adminId = request.admin!.adminId;

			const existing = await prisma.blogPost.findUnique({
				where: { slug: data.slug },
			});
			if (existing) {
				const error = conflict(`Blog post with slug "${data.slug}" already exists`);
				return reply.status(error.statusCode).send(error.toJSON());
			}

			const createData: any = { ...data };
			if (data.status === 'published' && !data.publishedAt) {
				createData.publishedAt = new Date();
			}

			const post = await prisma.blogPost.create({ data: createData });

			await logAudit({
				adminId,
				action: 'create',
				resourceType: 'BlogPost',
				resourceId: post.id,
				changes: data as unknown as Prisma.InputJsonValue,
			});

			return reply.status(201).send(post);
		},
	);

	// PUT /api/admin/blog/:id
	fastify.put<{ Params: { id: string } }>(
		'/api/admin/blog/:id',
		{ preHandler: [validate(BlogUpdateSchema)] },
		async (request, reply) => {
			const { id } = request.params;
			const data = request.body as Record<string, unknown>;
			const adminId = request.admin!.adminId;

			const existing = await prisma.blogPost.findUnique({ where: { id } });
			if (!existing) {
				const error = notFound('Blog post');
				return reply.status(error.statusCode).send(error.toJSON());
			}

			if (data.slug && data.slug !== existing.slug) {
				const slugExists = await prisma.blogPost.findUnique({
					where: { slug: data.slug as string },
				});
				if (slugExists) {
					const error = conflict(`Blog post with slug "${data.slug}" already exists`);
					return reply.status(error.statusCode).send(error.toJSON());
				}
			}

			const post = await prisma.blogPost.update({
				where: { id },
				data: data as any,
			});

			await logAudit({
				adminId,
				action: 'update',
				resourceType: 'BlogPost',
				resourceId: id,
				changes: data as unknown as Prisma.InputJsonValue,
			});

			return reply.send(post);
		},
	);

	// PATCH /api/admin/blog/:id/status
	fastify.patch<{ Params: { id: string } }>(
		'/api/admin/blog/:id/status',
		{ preHandler: [validate(BlogStatusSchema)] },
		async (request, reply) => {
			const { id } = request.params;
			const { status } = request.body as z.infer<typeof BlogStatusSchema>;
			const adminId = request.admin!.adminId;

			const existing = await prisma.blogPost.findUnique({ where: { id } });
			if (!existing) {
				const error = notFound('Blog post');
				return reply.status(error.statusCode).send(error.toJSON());
			}

			const updateData: any = { status };
			if (status === 'published' && !existing.publishedAt) {
				updateData.publishedAt = new Date();
			}

			const post = await prisma.blogPost.update({
				where: { id },
				data: updateData,
			});

			await logAudit({
				adminId,
				action: 'update',
				resourceType: 'BlogPost',
				resourceId: id,
				changes: { status, previousStatus: existing.status },
			});

			return reply.send(post);
		},
	);

	// DELETE /api/admin/blog/:id
	fastify.delete<{ Params: { id: string } }>('/api/admin/blog/:id', async (request, reply) => {
		const { id } = request.params;
		const adminId = request.admin!.adminId;

		const existing = await prisma.blogPost.findUnique({ where: { id } });
		if (!existing) {
			const error = notFound('Blog post');
			return reply.status(error.statusCode).send(error.toJSON());
		}

		await prisma.blogPost.delete({ where: { id } });

		await logAudit({
			adminId,
			action: 'delete',
			resourceType: 'BlogPost',
			resourceId: id,
			changes: { title: existing.title, slug: existing.slug },
		});

		return reply.send({ message: 'Blog post deleted' });
	});
}
