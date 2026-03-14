import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { ProfileSchema } from '../schemas/zod-schemas';
import { asyncHandler } from '../utils/asyncHandler';
import { getProfile, updateProfile } from '../controllers/profile.controller';

const router = Router();

router.get('/profile', asyncHandler(getProfile));

router.put('/profile', validate(ProfileSchema), asyncHandler(updateProfile));

export default router;
