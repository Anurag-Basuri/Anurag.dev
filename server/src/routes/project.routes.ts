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

router.get('/projects', asyncHandler(listProjects));

router.post('/projects', validate(ProjectCreateSchema), asyncHandler(createProject));

router.put('/projects/:id', validate(ProjectUpdateSchema), asyncHandler(updateProject));

router.patch(
	'/projects/:id/status',
	validate(ProjectStatusSchema),
	asyncHandler(updateProjectStatus),
);

router.delete('/projects/:id', asyncHandler(deleteProject));

export default router;
