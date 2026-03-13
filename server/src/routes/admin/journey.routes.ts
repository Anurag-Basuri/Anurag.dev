import { Router } from 'express';
import { z } from 'zod';
import { validate } from '../../middleware/validate.middleware';
import { JourneyItemSchema } from '../../schemas/zod-schemas';
import { asyncHandler } from '../../utils/asyncHandler';
import {
	listJourney,
	createJourney,
	updateJourney,
	reorderJourney,
	deleteJourney,
} from '../../controllers/journey.controller';

const JourneyUpdateSchema = JourneyItemSchema.partial().omit({ id: true });

const ReorderSchema = z.object({
	items: z.array(z.object({ id: z.string(), order: z.number().int().min(0) })),
});

const router = Router();

router.get('/api/admin/journey', asyncHandler(listJourney));

router.post(
	'/api/admin/journey',
	validate(JourneyItemSchema.omit({ id: true })),
	asyncHandler(createJourney),
);

router.put(
	'/api/admin/journey/:id',
	validate(JourneyUpdateSchema),
	asyncHandler(updateJourney),
);

router.patch(
	'/api/admin/journey/reorder',
	validate(ReorderSchema),
	asyncHandler(reorderJourney),
);

router.delete('/api/admin/journey/:id', asyncHandler(deleteJourney));

export default router;
