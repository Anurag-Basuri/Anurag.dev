import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { BlogCreateSchema, BlogUpdateSchema, BlogStatusSchema } from '../schemas/zod-schemas';
import { asyncHandler } from '../utils/asyncHandler';
import {
	listPosts,
	createPost,
	updatePost,
	updatePostStatus,
	deletePost,
} from '../controllers/blog.controller';

const router = Router();

router.get('/blog', asyncHandler(listPosts));

router.post('/blog', validate(BlogCreateSchema), asyncHandler(createPost));

router.put('/blog/:id', validate(BlogUpdateSchema), asyncHandler(updatePost));

router.patch('/blog/:id/status', validate(BlogStatusSchema), asyncHandler(updatePostStatus));

router.delete('/blog/:id', asyncHandler(deletePost));

export default router;
