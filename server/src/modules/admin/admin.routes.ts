import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import profileRoutes from './profile.routes';
import projectRoutes from './project.routes';
import journeyRoutes from './journey.routes';
import achievementRoutes from './achievement.routes';
import certificationRoutes from './certification.routes';
import blogRoutes from './blog.routes';
import messagesRoutes from './messages.routes';

const router = Router();

/**
 * Admin route aggregator.
 * All sub-routes require authentication.
 */
router.use(authMiddleware);

router.use(profileRoutes);
router.use(projectRoutes);
router.use(journeyRoutes);
router.use(achievementRoutes);
router.use(certificationRoutes);
router.use(blogRoutes);
router.use(messagesRoutes);

export default router;
