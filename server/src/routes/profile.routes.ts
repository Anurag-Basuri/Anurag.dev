import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import {
	ProfileUpdateSchema,
	SocialLinkCreateSchema,
	SocialLinkUpdateSchema,
} from '../schemas/zod-schemas';
import { asyncHandler } from '../utils/asyncHandler';
import { imageUpload, documentUpload } from '../middleware/multer.middleware';
import {
	getProfile,
	updateProfile,
	uploadAvatar,
	uploadCover,
	uploadResumeFile,
	listSocialLinks,
	createSocialLink,
	updateSocialLink,
	deleteSocialLink,
} from '../controllers/profile.controller';

const router = Router();

router.get('/profile', asyncHandler(getProfile));

router.put('/profile', validate(ProfileUpdateSchema), asyncHandler(updateProfile));

// Social links
router.get('/profile/social-links', asyncHandler(listSocialLinks));
router.post(
	'/profile/social-links',
	validate(SocialLinkCreateSchema),
	asyncHandler(createSocialLink),
);
router.put(
	'/profile/social-links/:id',
	validate(SocialLinkUpdateSchema),
	asyncHandler(updateSocialLink),
);
router.delete('/profile/social-links/:id', asyncHandler(deleteSocialLink));

// File upload endpoints
router.post('/profile/avatar', imageUpload.single('avatar'), asyncHandler(uploadAvatar));
router.post('/profile/cover', imageUpload.single('cover'), asyncHandler(uploadCover));
router.post('/profile/resume', documentUpload.single('resume'), asyncHandler(uploadResumeFile));

export default router;
