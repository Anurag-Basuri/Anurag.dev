import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';
import { ProjectSchema } from '../schemas/zod-schemas';
import { asyncHandler } from '../utils/asyncHandler';
import {
	listProjects,
	createProject,
	updateProject,
	updateProjectStatus,
	deleteProject,
} from '../controllers/project.controller';

const ProjectCreateSchema = ProjectSchema.omit({ id: true, createdAt: true, updatedAt: true });
const ProjectUpdateSchema = ProjectSchema.partial().omit({
	id: true,
	createdAt: true,
	updatedAt: true,
});
const StatusSchema = z.object({ status: z.enum(['draft', 'published', 'archived', 'completed']) });

const router = Router();

router.get('/admin/projects', asyncHandler(listProjects));

router.post('/admin/projects', validate(ProjectCreateSchema), asyncHandler(createProject));

router.put('/admin/projects/:id', validate(ProjectUpdateSchema), asyncHandler(updateProject));

router.patch(
	'/admin/projects/:id/status',
	validate(StatusSchema),
	asyncHandler(updateProjectStatus),
);

router.delete('/admin/projects/:id', asyncHandler(deleteProject));

export default router;
