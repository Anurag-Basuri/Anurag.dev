import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import {
	ProjectCreateSchema,
	ProjectUpdateSchema,
	ProjectStatusSchema,
} from '../schemas/zod-schemas';
import { asyncHandler } from '../utils/asyncHandler';
import {
	listProjects,
	createProject,
	updateProject,
	updateProjectStatus,
	deleteProject,
} from '../controllers/project.controller';

const router = Router();

router.get('/admin/projects', asyncHandler(listProjects));

router.post('/admin/projects', validate(ProjectCreateSchema), asyncHandler(createProject));

router.put('/admin/projects/:id', validate(ProjectUpdateSchema), asyncHandler(updateProject));

router.patch(
	'/admin/projects/:id/status',
	validate(ProjectStatusSchema),
	asyncHandler(updateProjectStatus),
);

router.delete('/admin/projects/:id', asyncHandler(deleteProject));

export default router;
