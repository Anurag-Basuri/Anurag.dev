import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';
import { BlogPostSchema } from '../schemas/zod-schemas';
import { asyncHandler } from '../utils/asyncHandler';
import {
	listPosts,
	createPost,
	updatePost,
	updatePostStatus,
	deletePost,
} from '../controllers/blog.controller';

const BlogCreateSchema = BlogPostSchema.omit({ id: true, createdAt: true, updatedAt: true });
const BlogUpdateSchema = BlogPostSchema.partial().omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});
const BlogStatusSchema = z.object({ status: z.enum(['draft', 'published', 'archived']) });

const router = Router();

router.get('/admin/blog', asyncHandler(listPosts));

router.post('/admin/blog', validate(BlogCreateSchema), asyncHandler(createPost));

router.put('/admin/blog/:id', validate(BlogUpdateSchema), asyncHandler(updatePost));

router.patch(
	'/admin/blog/:id/status',
	validate(BlogStatusSchema),
	asyncHandler(updatePostStatus),
);

router.delete('/admin/blog/:id', asyncHandler(deletePost));

export default router;
