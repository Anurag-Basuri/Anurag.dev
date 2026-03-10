import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/db';
import {
	verifyPassword,
	generateTokenPair,
	rotateRefreshToken,
	revokeRefreshToken,
} from './auth.service';
import { validate } from '../../middleware/validate';
import { rateLimit } from '../../middleware/rate-limit';
import { unauthorized } from '../../lib/errors';
import { authMiddleware } from '../../middleware/auth.middleware';
import { asyncHandler } from '../../utils/asyncHandler';

// ─── Schemas ──────────────────────────────────────────────────────

const LoginSchema = z.object({
	username: z.string().min(1, 'Username is required'),
	password: z.string().min(1, 'Password is required'),
});

const RefreshSchema = z.object({
	refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ─── Routes ───────────────────────────────────────────────────────

const router = Router();

// POST /api/auth/login
router.post(
	'/api/auth/login',
	rateLimit({ max: 10, windowSeconds: 15 * 60, prefix: 'login' }),
	validate(LoginSchema),
	asyncHandler(async (req, res) => {
		const { username, password } = req.body as z.infer<typeof LoginSchema>;

		const admin = await prisma.admin.findUnique({ where: { username } });

		if (!admin || !(await verifyPassword(password, admin.passwordHash))) {
			throw unauthorized('Invalid username or password');
		}

		const tokens = await generateTokenPair({
			adminId: admin.id,
			username: admin.username,
		});

		res.json(tokens);
	}),
);

// POST /api/auth/refresh
router.post(
	'/api/auth/refresh',
	validate(RefreshSchema),
	asyncHandler(async (req, res) => {
		const { refreshToken } = req.body as z.infer<typeof RefreshSchema>;
		const tokens = await rotateRefreshToken(refreshToken);
		res.json(tokens);
	}),
);

// POST /api/auth/logout
router.post(
	'/api/auth/logout',
	authMiddleware,
	asyncHandler(async (req, res) => {
		const { refreshToken } = (req.body as { refreshToken?: string }) || {};

		if (refreshToken) {
			await revokeRefreshToken(refreshToken);
		}

		res.json({ message: 'Logged out successfully' });
	}),
);

// GET /api/auth/me
router.get(
	'/api/auth/me',
	authMiddleware,
	asyncHandler(async (req, res) => {
		const admin = await prisma.admin.findUnique({
			where: { id: req.admin!.adminId },
			select: { id: true, username: true, createdAt: true },
		});

		if (!admin) throw unauthorized('Admin not found');

		res.json(admin);
	}),
);

export default router;
