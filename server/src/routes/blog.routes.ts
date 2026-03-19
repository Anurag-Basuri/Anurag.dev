import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import {
	BlogCreateSchema,
	BlogUpdateSchema,
	BlogStatusSchema,
	UrlListSchema,
} from '../schemas/zod-schemas';
import { asyncHandler } from '../utils/asyncHandler';
import {
	listPosts,
	createPost,
	updatePost,
	updatePostStatus,
	deletePost,
	uploadBlogCover,
	uploadBlogImages,
	replaceBlogImages,
	deleteBlogImages,
} from '../controllers/blog.controller';
import { imageUpload } from '../middleware/multer.middleware';

const router = Router();

router.get('/blog', asyncHandler(listPosts));

router.post('/blog', validate(BlogCreateSchema), asyncHandler(createPost));

router.put('/blog/:id', validate(BlogUpdateSchema), asyncHandler(updatePost));

router.patch('/blog/:id/status', validate(BlogStatusSchema), asyncHandler(updatePostStatus));

// Upload endpoints (admin-only)
router.post('/blog/:id/cover', imageUpload.single('cover'), asyncHandler(uploadBlogCover));
router.post('/blog/:id/images', imageUpload.array('images', 10), asyncHandler(uploadBlogImages));
router.put('/blog/:id/images', imageUpload.array('images', 10), asyncHandler(replaceBlogImages));
router.delete('/blog/:id/images', validate(UrlListSchema), asyncHandler(deleteBlogImages));

router.delete('/blog/:id', asyncHandler(deletePost));

export default router;
