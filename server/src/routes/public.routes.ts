import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { rateLimit } from '../middleware/rate-limit.middleware';
import { cacheControl } from '../middleware/cache.middleware';
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
import { getCodingStats } from '../controllers/coding-stats.controller';

const router = Router();
const cache5min = cacheControl(300);

// Health
router.get('/health', asyncHandler(healthCheck));

// Profile
router.get('/profile', cache5min, asyncHandler(getPublicProfile));

// Projects
router.get('/projects', cache5min, asyncHandler(getPublicProjects));
router.get('/projects/:slug', cache5min, asyncHandler(getPublicProjectBySlug));

// Journey
router.get('/journey', cache5min, asyncHandler(getPublicJourney));

// Achievements
router.get('/achievements', cache5min, asyncHandler(getPublicAchievements));

// Certifications
router.get('/certifications', cache5min, asyncHandler(getPublicCertifications));

// Blog
router.get('/blog', cache5min, asyncHandler(getPublicBlogPosts));
router.get('/blog/:slug', cache5min, asyncHandler(getPublicBlogPostBySlug));

// Coding Stats (aggregated from external platforms)
router.get('/coding-stats', cache5min, asyncHandler(getCodingStats));

// Contact (no cache — write operation)
router.post(
	'/contact',
	rateLimit({ max: 5, windowSeconds: 60 * 60, prefix: 'contact' }),
	validate(ContactSchema),
	asyncHandler(submitContact),
);

export default router;
