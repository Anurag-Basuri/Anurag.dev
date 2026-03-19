import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import {
	ProjectCreateSchema,
	ProjectUpdateSchema,
	ProjectStatusSchema,
	UrlListSchema,
} from '../schemas/zod-schemas';
import { asyncHandler } from '../utils/asyncHandler';
import {
	listProjects,
	createProject,
	updateProject,
	updateProjectStatus,
	deleteProject,
	uploadProjectThumbnail,
	uploadProjectImages,
	replaceProjectImages,
	deleteProjectImages,
} from '../controllers/project.controller';
import { imageUpload } from '../middleware/multer.middleware';

const router = Router();

router.get('/projects', asyncHandler(listProjects));

router.post('/projects', validate(ProjectCreateSchema), asyncHandler(createProject));

router.put('/projects/:id', validate(ProjectUpdateSchema), asyncHandler(updateProject));

router.patch(
	'/projects/:id/status',
	validate(ProjectStatusSchema),
	asyncHandler(updateProjectStatus),
);

// Upload endpoints (admin-only)
router.post(
	'/projects/:id/thumbnail',
	imageUpload.single('thumbnail'),
	asyncHandler(uploadProjectThumbnail),
);

router.post(
	'/projects/:id/images',
	imageUpload.array('images', 10),
	asyncHandler(uploadProjectImages),
);

router.put(
	'/projects/:id/images',
	imageUpload.array('images', 10),
	asyncHandler(replaceProjectImages),
);

router.delete('/projects/:id/images', validate(UrlListSchema), asyncHandler(deleteProjectImages));

router.delete('/projects/:id', asyncHandler(deleteProject));

export default router;
