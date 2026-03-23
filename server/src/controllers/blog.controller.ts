import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';
import { ApiResponse } from '../utils/ApiResponse';
import { logAudit } from '../lib/audit';
import { uploadFile, deleteFile, deleteFiles, buildDeleteTarget } from '../lib/cloudinary';
import type { IdRequest } from '../utils/types';

// List all blog posts (admin)
async function listPosts(_req: Request, res: Response): Promise<void> {
	const posts = await prisma.blogPost.findMany({
		orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
	});
	ApiResponse.ok(res, posts);
}

// Create a new blog post
async function createPost(req: Request, res: Response): Promise<void> {
	const data = req.body;
	const adminId = req.admin!.adminId;

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

// Update an existing blog post
async function updatePost(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const data = req.body;
	const adminId = req.admin!.adminId;

	const existing = await prisma.blogPost.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Blog post');

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

// Update blog post status
async function updatePostStatus(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
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

// Delete a blog post
async function deletePost(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const adminId = req.admin!.adminId;

	const existing = await prisma.blogPost.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Blog post');

	await prisma.blogPost.delete({ where: { id } });

	await logAudit({
		adminId,
		action: 'delete',
		resourceType: 'BlogPost',
		resourceId: id,
		changes: { title: existing.title },
	});

	ApiResponse.noContent(res);
}

// Upload blog cover image (replaces existing)
async function uploadBlogCover(req: IdRequest, res: Response): Promise<void> {
	if (!req.file) throw ApiError.BadRequest('No file provided');
	const { id } = req.params;
	const adminId = req.admin!.adminId;

	const existing = await prisma.blogPost.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Blog post');

	const result = await uploadFile(req.file, { folder: 'portfolio/blog/cover' });

	if (existing.coverImage) {
		const target = buildDeleteTarget(existing.coverImage);
		if (target) await deleteFile(target);
	}

	const post = await prisma.blogPost.update({
		where: { id },
		data: { coverImage: result.url },
	});

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'BlogPost',
		resourceId: id,
		changes: { coverImage: result.url },
	});

	ApiResponse.ok(res, post, 'Cover image uploaded');
}

// Append blog images
async function uploadBlogImages(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const adminId = req.admin!.adminId;
	const files = req.files as Express.Multer.File[] | undefined;
	if (!files?.length) throw ApiError.BadRequest('No files provided');

	const existing = await prisma.blogPost.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Blog post');

	const uploads = await Promise.all(
		files.map(file => uploadFile(file, { folder: 'portfolio/blog/images' })),
	);
	const newUrls = uploads.map(upload => upload.url);

	const post = await prisma.blogPost.update({
		where: { id },
		data: { otherImages: [...existing.otherImages, ...newUrls] },
	});

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'BlogPost',
		resourceId: id,
		changes: { imagesAdded: newUrls },
	});

	ApiResponse.ok(res, post, 'Images uploaded');
}

// Replace all blog images
async function replaceBlogImages(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const adminId = req.admin!.adminId;
	const files = req.files as Express.Multer.File[] | undefined;
	if (!files?.length) throw ApiError.BadRequest('No files provided');

	const existing = await prisma.blogPost.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Blog post');

	const uploads = await Promise.all(
		files.map(file => uploadFile(file, { folder: 'portfolio/blog/images' })),
	);
	const newUrls = uploads.map(upload => upload.url);

	const deleteTargets = existing.otherImages
		.map(image => buildDeleteTarget(image))
		.filter((target): target is NonNullable<typeof target> => Boolean(target));
	if (deleteTargets.length) await deleteFiles(deleteTargets);

	const post = await prisma.blogPost.update({
		where: { id },
		data: { otherImages: newUrls },
	});

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'BlogPost',
		resourceId: id,
		changes: { imagesReplaced: newUrls },
	});

	ApiResponse.ok(res, post, 'Images replaced');
}

// Delete selected blog images
async function deleteBlogImages(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const { urls } = req.body as { urls: string[] };
	const adminId = req.admin!.adminId;

	const existing = await prisma.blogPost.findUnique({ where: { id } });
	if (!existing) throw ApiError.NotFound('Blog post');

	const toRemove = existing.otherImages.filter(image => urls.includes(image));
	const remaining = existing.otherImages.filter(image => !urls.includes(image));

	const deleteTargets = toRemove
		.map(image => buildDeleteTarget(image))
		.filter((target): target is NonNullable<typeof target> => Boolean(target));
	if (deleteTargets.length) await deleteFiles(deleteTargets);

	const post = await prisma.blogPost.update({
		where: { id },
		data: { otherImages: remaining },
	});

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'BlogPost',
		resourceId: id,
		changes: { imagesRemoved: toRemove },
	});

	ApiResponse.ok(res, post, 'Images deleted');
}

// Bulk reorder blog posts
async function reorderPosts(req: Request, res: Response): Promise<void> {
	const { items } = req.body as { items: { id: string; order: number }[] };
	const adminId = req.admin!.adminId;

	if (!Array.isArray(items)) throw ApiError.BadRequest('Invalid payload format');

	await prisma.$transaction(
		items.map(item =>
			prisma.blogPost.update({
				where: { id: item.id },
				data: { order: item.order },
			})
		)
	);

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'BlogPost',
		resourceId: 'bulk-reorder',
		changes: { reorderedParams: items.length },
	});

	ApiResponse.ok(res, null, 'Posts reordered successfully');
}

export {
	listPosts,
	createPost,
	updatePost,
	updatePostStatus,
	deletePost,
	uploadBlogCover,
	uploadBlogImages,
	replaceBlogImages,
	deleteBlogImages,
	reorderPosts,
};
