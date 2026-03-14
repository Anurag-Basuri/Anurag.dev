import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { JourneyCreateSchema, JourneyUpdateSchema, ReorderSchema } from '../schemas/zod-schemas';
import { asyncHandler } from '../utils/asyncHandler';
import {
	listJourney,
	createJourney,
	updateJourney,
	reorderJourney,
	deleteJourney,
} from '../controllers/journey.controller';

const router = Router();

router.get('/journey', asyncHandler(listJourney));

router.post('/journey', validate(JourneyCreateSchema), asyncHandler(createJourney));

router.put('/journey/:id', validate(JourneyUpdateSchema), asyncHandler(updateJourney));

router.patch('/journey/reorder', validate(ReorderSchema), asyncHandler(reorderJourney));

router.delete('/journey/:id', asyncHandler(deleteJourney));

export default router;
