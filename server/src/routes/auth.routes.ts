import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { rateLimit } from '../middleware/rate-limit.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';
import {
	loginHandler,
	refreshHandler,
	logoutHandler,
	meHandler,
	LoginSchema,
	RefreshSchema,
} from '../controllers/auth.controller';

const router = Router();

router.post(
	'/api/auth/login',
	rateLimit({ max: 10, windowSeconds: 15 * 60, prefix: 'login' }),
	validate(LoginSchema),
	asyncHandler(loginHandler),
);

router.post(
	'/api/auth/refresh',
	validate(RefreshSchema),
	asyncHandler(refreshHandler),
);

router.post(
	'/api/auth/logout',
	authMiddleware,
	asyncHandler(logoutHandler),
);

router.get(
	'/api/auth/me',
	authMiddleware,
	asyncHandler(meHandler),
);

export default router;
