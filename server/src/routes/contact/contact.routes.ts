import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { rateLimit } from '../../middleware/rate-limit.middleware';
import { ContactSchema } from '../../schemas/zod-schemas';
import { asyncHandler } from '../../utils/asyncHandler';
import { submitContact } from '../../controllers/contact.controller';

const router = Router();

router.post(
	'/api/contact',
	rateLimit({ max: 5, windowSeconds: 60 * 60, prefix: 'contact' }),
	validate(ContactSchema),
	asyncHandler(submitContact),
);

export default router;
