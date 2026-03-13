import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';
import { JourneyItemSchema } from '../schemas/zod-schemas';
import { asyncHandler } from '../utils/asyncHandler';
import {
	listJourney,
	createJourney,
	updateJourney,
	reorderJourney,
	deleteJourney,
} from '../controllers/journey.controller';

const JourneyCreateSchema = JourneyItemSchema.omit({ id: true });
const JourneyUpdateSchema = JourneyItemSchema.partial().omit({ id: true });
const ReorderSchema = z.object({
	items: z.array(z.object({ id: z.string(), order: z.number().int().min(0) })),
});

const router = Router();

router.get('/admin/journey', asyncHandler(listJourney));

router.post('/admin/journey', validate(JourneyCreateSchema), asyncHandler(createJourney));

router.put('/admin/journey/:id', validate(JourneyUpdateSchema), asyncHandler(updateJourney));

router.patch('/admin/journey/reorder', validate(ReorderSchema), asyncHandler(reorderJourney));

router.delete('/admin/journey/:id', asyncHandler(deleteJourney));

export default router;
