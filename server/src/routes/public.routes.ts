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
	getPublicProjectById,
	getPublicJourney,
	getPublicAchievements,
	getPublicCertifications,
	getPublicBlogPosts,
	getPublicBlogPostById,
	submitContact,
} from '../controllers/public.controller';
import { getCodingStats } from '../controllers/coding-stats.controller';
import { getLinkPreview } from '../controllers/link-preview.controller';

const router = Router();
const cache5min = cacheControl(300);
const cache24hr = cacheControl(86400);

// Health
router.get('/health', asyncHandler(healthCheck));

// Profile
router.get('/profile', cache5min, asyncHandler(getPublicProfile));

// Projects
router.get('/projects', cache5min, asyncHandler(getPublicProjects));
router.get('/projects/:id', cache5min, asyncHandler(getPublicProjectById));

// Journey
router.get('/journey', cache5min, asyncHandler(getPublicJourney));

// Achievements
router.get('/achievements', cache5min, asyncHandler(getPublicAchievements));

// Certifications
router.get('/certifications', cache5min, asyncHandler(getPublicCertifications));

// Blog
router.get('/blog', cache5min, asyncHandler(getPublicBlogPosts));
router.get('/blog/:id', cache5min, asyncHandler(getPublicBlogPostById));

// Coding Stats (aggregated from external platforms)
router.get('/coding-stats', cache5min, asyncHandler(getCodingStats));

// Link Preview (OG image extraction)
router.get('/link-preview', cache24hr, asyncHandler(getLinkPreview));

// Contact (no cache — write operation)
router.post(
	'/contact',
	rateLimit({ max: 5, windowSeconds: 60 * 60, prefix: 'contact' }),
	validate(ContactSchema),
	asyncHandler(submitContact),
);

export default router;
