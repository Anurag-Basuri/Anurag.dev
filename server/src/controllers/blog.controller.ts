import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { logAudit } from '../lib/audit';

// Controller for listing all blog posts (admin view, includes drafts and archived)
async function listPosts(_req: Request, res: Response): Promise<void> {
	const posts = await prisma.blogPost.findMany({
		orderBy: { createdAt: 'desc' },
	});
	ApiResponse.ok(res, posts);
}

// Controller for creating a new blog post
async function createPost(req: Request, res: Response): Promise<void> {
	const data = req.body;
	const adminId = req.admin!.adminId;

	const existing = await prisma.blogPost.findUnique({ where: { slug: data.slug } });
	if (existing) throw ApiError.Conflict(`Blog post with slug "${data.slug}" already exists`);

	const createData = { ...data };
	if (data.status === 'published' && !data.publishedAt) {
		createData.publishedAt = new Date();
	}

	const post = await prisma.blogPost.create({ data: createData });

	await logAudit({
		adminId,
		action: 'create',
		resourceType: 'BlogPost',
		resourceId: post.id,
		changes: data,
	});

	ApiResponse.created(res, post);
}

// Controller for updating an existing blog post
async function updatePost(req: Request, res: Response): Promise<void> {
	const id = req.params.id as string;
	const data = req.body;
	const adminId = req.admin!.adminId;

	const existing = await prisma.blogPost.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Blog post');

	if (data.slug && data.slug !== existing.slug) {
		const slugExists = await prisma.blogPost.findUnique({ where: { slug: data.slug } });
		if (slugExists)
			throw ApiError.Conflict(`Blog post with slug "${data.slug}" already exists`);
	}

	const post = await prisma.blogPost.update({ where: { id }, data });

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'BlogPost',
		resourceId: id,
		changes: data,
	});

	ApiResponse.ok(res, post, 'Blog post updated');
}

// Controller for updating only the status of a blog post (e.g. publish/unpublish/archive)
async function updatePostStatus(req: Request, res: Response): Promise<void> {
	const id = req.params.id as string;
	const { status } = req.body;
	const adminId = req.admin!.adminId;

	const existing = await prisma.blogPost.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Blog post');

	const updateData: Record<string, unknown> = { status };
	if (status === 'published' && !existing.publishedAt) {
		updateData.publishedAt = new Date();
	}

	const post = await prisma.blogPost.update({ where: { id }, data: updateData });

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'BlogPost',
		resourceId: id,
		changes: { status, previousStatus: existing.status },
	});

	ApiResponse.ok(res, post, 'Status updated');
}

// Controller for deleting a blog post
async function deletePost(req: Request, res: Response): Promise<void> {
	const id = req.params.id as string;
	const adminId = req.admin!.adminId;

	const existing = await prisma.blogPost.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Blog post');

	await prisma.blogPost.delete({ where: { id } });

	await logAudit({
		adminId,
		action: 'delete',
		resourceType: 'BlogPost',
		resourceId: id,
		changes: { title: existing.title, slug: existing.slug },
	});

	ApiResponse.noContent(res);
}

export { listPosts, createPost, updatePost, updatePostStatus, deletePost };
