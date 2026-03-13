import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.middleware';
import { BlogPostSchema } from '../../schemas/zod-schemas';
import { asyncHandler } from '../../utils/asyncHandler';
import {
	listPosts,
	createPost,
	updatePost,
	updatePostStatus,
	deletePost,
} from '../../controllers/blog.controller';

const BlogUpdateSchema = BlogPostSchema.partial().omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});

const BlogStatusSchema = z.object({
	status: z.enum(['draft', 'published', 'archived']),
});

const router = Router();

router.get('/api/admin/blog', asyncHandler(listPosts));

router.post(
	'/api/admin/blog',
	validate(BlogPostSchema.omit({ id: true, createdAt: true, updatedAt: true })),
	asyncHandler(createPost),
);

router.put(
	'/api/admin/blog/:id',
	validate(BlogUpdateSchema),
	asyncHandler(updatePost),
);

router.patch(
	'/api/admin/blog/:id/status',
	validate(BlogStatusSchema),
	asyncHandler(updatePostStatus),
);

router.delete('/api/admin/blog/:id', asyncHandler(deletePost));

export default router;
