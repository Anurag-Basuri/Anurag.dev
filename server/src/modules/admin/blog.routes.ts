import { Router, Request } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../../lib/db';
import { validate } from '../../middleware/validate';
import { logAudit } from '../../lib/audit';
import { notFound, conflict } from '../../lib/errors';
import { BlogPostSchema } from '../../schemas/zod-schemas';
import { asyncHandler } from '../../utils/asyncHandler';

const BlogUpdateSchema = BlogPostSchema.partial().omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

const BlogStatusSchema = z.object({
	status: z.enum(['draft', 'published', 'archived']),
});

const router = Router();

// GET /api/admin/blog
router.get(
	'/api/admin/blog',
	asyncHandler(async (_req, res) => {
		const posts = await prisma.blogPost.findMany({
			orderBy: { createdAt: 'desc' },
		});
		res.json({ posts });
	}),
);

// POST /api/admin/blog
router.post(
	'/api/admin/blog',
	validate(BlogPostSchema.omit({ id: true, createdAt: true, updatedAt: true })),
	asyncHandler(async (req, res) => {
		const data = req.body as z.infer<typeof BlogPostSchema>;
		const adminId = req.admin!.adminId;

		const existing = await prisma.blogPost.findUnique({ where: { slug: data.slug } });
		if (existing) throw conflict(`Blog post with slug "${data.slug}" already exists`);

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

		res.status(201).json(post);
	}),
);

// PUT /api/admin/blog/:id
router.put(
	'/api/admin/blog/:id',
	validate(BlogUpdateSchema),
	asyncHandler(async (req: Request<{ id: string }>, res) => {
		const { id } = req.params;
		const data = req.body as Record<string, unknown>;
		const adminId = req.admin!.adminId;

		const existing = await prisma.blogPost.findUnique({ where: { id } });
		if (!existing) throw notFound('Blog post');

		if (data.slug && data.slug !== existing.slug) {
			const slugExists = await prisma.blogPost.findUnique({
				where: { slug: data.slug as string },
			});
			if (slugExists) throw conflict(`Blog post with slug "${data.slug}" already exists`);
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

		res.json(post);
	}),
);

// PATCH /api/admin/blog/:id/status
router.patch(
	'/api/admin/blog/:id/status',
	validate(BlogStatusSchema),
	asyncHandler(async (req: Request<{ id: string }>, res) => {
		const { id } = req.params;
		const { status } = req.body as z.infer<typeof BlogStatusSchema>;
		const adminId = req.admin!.adminId;

		const existing = await prisma.blogPost.findUnique({ where: { id } });
		if (!existing) throw notFound('Blog post');

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

		res.json(post);
	}),
);

// DELETE /api/admin/blog/:id
router.delete(
	'/api/admin/blog/:id',
	asyncHandler(async (req: Request<{ id: string }>, res) => {
		const { id } = req.params;
		const adminId = req.admin!.adminId;

		const existing = await prisma.blogPost.findUnique({ where: { id } });
		if (!existing) throw notFound('Blog post');

		await prisma.blogPost.delete({ where: { id } });

		await logAudit({
			adminId,
			action: 'delete',
			resourceType: 'BlogPost',
			resourceId: id,
			changes: { title: existing.title, slug: existing.slug },
		});

		res.json({ message: 'Blog post deleted' });
	}),
);

export default router;
