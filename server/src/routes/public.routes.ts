import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { rateLimit } from '../middleware/rate-limit.middleware';
import { ContactSchema } from '../schemas/zod-schemas';
import { asyncHandler } from '../utils/asyncHandler';
import {
	healthCheck,
	getPublicProfile,
	getPublicProjects,
	getPublicProjectBySlug,
	getPublicJourney,
	getPublicAchievements,
	getPublicCertifications,
	getPublicBlogPosts,
	getPublicBlogPostBySlug,
	submitContact,
} from '../controllers/public.controller';

const router = Router();

// Health
router.get('/health', asyncHandler(healthCheck));

// Profile
router.get('/profile', asyncHandler(getPublicProfile));

// Projects
router.get('/projects', asyncHandler(getPublicProjects));
router.get('/projects/:slug', asyncHandler(getPublicProjectBySlug));

// Journey
router.get('/journey', asyncHandler(getPublicJourney));

// Achievements
router.get('/achievements', asyncHandler(getPublicAchievements));

// Certifications
router.get('/certifications', asyncHandler(getPublicCertifications));

// Blog
router.get('/blog', asyncHandler(getPublicBlogPosts));
router.get('/blog/:slug', asyncHandler(getPublicBlogPostBySlug));

// Contact
router.post(
	'/contact',
	rateLimit({ max: 5, windowSeconds: 60 * 60, prefix: 'contact' }),
	validate(ContactSchema),
	asyncHandler(submitContact),
);

export default router;
