import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import {
	BlogCreateSchema,
	BlogUpdateSchema,
	BlogStatusSchema,
} from '../schemas/zod-schemas';
import { asyncHandler } from '../utils/asyncHandler';
import {
	listPosts,
	createPost,
	updatePost,
	updatePostStatus,
	deletePost,
} from '../controllers/blog.controller';

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
