import { Request, Response } from 'express';
import { z } from 'zod';
import { login, rotateRefreshToken, getAdminInfo } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';

const LoginSchema = z.object({
	username: z.string().min(1, 'Username is required'),
	password: z.string().min(1, 'Password is required'),
});

const RefreshSchema = z.object({
	refreshToken: z.string().min(1, 'Refresh token is required'),
});

async function loginHandler(req: Request, res: Response): Promise<void> {
	const { username, password } = req.body as z.infer<typeof LoginSchema>;
	const tokens = await login(username, password);
	ApiResponse.ok(res, tokens, 'Login successful');
}

async function refreshHandler(req: Request, res: Response): Promise<void> {
	const { refreshToken } = req.body as z.infer<typeof RefreshSchema>;
	const tokens = rotateRefreshToken(refreshToken);
	ApiResponse.ok(res, tokens);
}

async function logoutHandler(_req: Request, res: Response): Promise<void> {
	ApiResponse.ok(res, null, 'Logged out successfully');
}

async function meHandler(req: Request, res: Response): Promise<void> {
	const admin = getAdminInfo(req.admin!);
	ApiResponse.ok(res, admin);
}

export { LoginSchema, RefreshSchema, loginHandler, refreshHandler, logoutHandler, meHandler };
