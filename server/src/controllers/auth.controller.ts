import { Request, Response } from 'express';
import { z } from 'zod';
import { login, rotateRefreshToken, getAdminInfo } from '../routes/auth/auth.service';
import { ApiResponse } from '../utils/ApiResponse';

const LoginSchema = z.object({
	username: z.string().min(1, 'Username is required'),
	password: z.string().min(1, 'Password is required'),
});

const RefreshSchema = z.object({
	refreshToken: z.string().min(1, 'Refresh token is required'),
});

/**
 * POST /api/auth/login
 */
export async function loginHandler(req: Request, res: Response): Promise<void> {
	const { username, password } = req.body as z.infer<typeof LoginSchema>;
	const tokens = await login(username, password);
	ApiResponse.ok(res, tokens, 'Login successful');
}

/**
 * POST /api/auth/refresh
 */
export async function refreshHandler(req: Request, res: Response): Promise<void> {
	const { refreshToken } = req.body as z.infer<typeof RefreshSchema>;
	const tokens = rotateRefreshToken(refreshToken);
	ApiResponse.ok(res, tokens);
}

/**
 * POST /api/auth/logout
 * Stateless — client simply discards tokens.
 */
export async function logoutHandler(_req: Request, res: Response): Promise<void> {
	ApiResponse.ok(res, null, 'Logged out successfully');
}

/**
 * GET /api/auth/me
 */
export async function meHandler(req: Request, res: Response): Promise<void> {
	const admin = getAdminInfo(req.admin!);
	ApiResponse.ok(res, admin);
}

export { LoginSchema, RefreshSchema };
