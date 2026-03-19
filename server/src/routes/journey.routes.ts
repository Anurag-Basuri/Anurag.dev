import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import {
	JourneyCreateSchema,
	JourneyUpdateSchema,
	JourneyDocumentCreateSchema,
	JourneyDocumentUpdateSchema,
	ReorderSchema,
} from '../schemas/zod-schemas';
import { asyncHandler } from '../utils/asyncHandler';
import {
	listJourney,
	createJourney,
	updateJourney,
	reorderJourney,
	deleteJourney,
	listJourneyDocuments,
	createJourneyDocument,
	updateJourneyDocument,
	deleteJourneyDocument,
} from '../controllers/journey.controller';
import { mediaUpload } from '../middleware/multer.middleware';

const router = Router();

router.get('/journey', asyncHandler(listJourney));

router.post('/journey', validate(JourneyCreateSchema), asyncHandler(createJourney));

router.put('/journey/:id', validate(JourneyUpdateSchema), asyncHandler(updateJourney));

router.patch('/journey/reorder', validate(ReorderSchema), asyncHandler(reorderJourney));

// Journey documents (admin-only)
router.get('/journey/:id/documents', asyncHandler(listJourneyDocuments));
router.post(
	'/journey/:id/documents',
	mediaUpload.single('file'),
	validate(JourneyDocumentCreateSchema),
	asyncHandler(createJourneyDocument),
);
router.put(
	'/journey/documents/:id',
	mediaUpload.single('file'),
	validate(JourneyDocumentUpdateSchema),
	asyncHandler(updateJourneyDocument),
);
router.delete('/journey/documents/:id', asyncHandler(deleteJourneyDocument));

router.delete('/journey/:id', asyncHandler(deleteJourney));

export default router;
