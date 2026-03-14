import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import {
	JourneyCreateSchema,
	JourneyUpdateSchema,
	ReorderSchema,
} from '../schemas/zod-schemas';
import { asyncHandler } from '../utils/asyncHandler';
import {
	listJourney,
	createJourney,
	updateJourney,
	reorderJourney,
	deleteJourney,
} from '../controllers/journey.controller';

const router = Router();

router.get('/admin/journey', asyncHandler(listJourney));

router.post('/admin/journey', validate(JourneyCreateSchema), asyncHandler(createJourney));

router.put('/admin/journey/:id', validate(JourneyUpdateSchema), asyncHandler(updateJourney));

router.patch('/admin/journey/reorder', validate(ReorderSchema), asyncHandler(reorderJourney));

router.delete('/admin/journey/:id', asyncHandler(deleteJourney));

export default router;
