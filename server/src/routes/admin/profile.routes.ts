import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { ProfileSchema } from '../../schemas/zod-schemas';
import { asyncHandler } from '../../utils/asyncHandler';
import { getProfile, updateProfile } from '../../controllers/profile.controller';

const router = Router();

router.get('/api/admin/profile', asyncHandler(getProfile));
router.put('/api/admin/profile', validate(ProfileSchema), asyncHandler(updateProfile));

export default router;
