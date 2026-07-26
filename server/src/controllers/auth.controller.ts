import { Request, Response } from 'express';
import { z } from 'zod';
import { LoginSchema, RefreshSchema } from '../schemas/zod-schemas';
import { login, rotateRefreshToken, getAdminInfo } from '../services/auth.service';
import { ApiResponse } from '../utils/ApiResponse';

// Login handler for admin
async function loginHandler(req: Request, res: Response): Promise<void> {
	const { username, password } = req.body as z.infer<typeof LoginSchema>;
	const tokens = await login(username, password);
	ApiResponse.ok(res, tokens, 'Login successful');
}

// Refresh handler for admin
async function refreshHandler(req: Request, res: Response): Promise<void> {
	const { refreshToken } = req.body as z.infer<typeof RefreshSchema>;
	const tokens = rotateRefreshToken(refreshToken);
	ApiResponse.ok(res, tokens);
}

// Logout handler for admin
async function logoutHandler(_req: Request, res: Response): Promise<void> {
	ApiResponse.ok(res, null, 'Logged out successfully');
}

// Get admin info handler
async function meHandler(req: Request, res: Response): Promise<void> {
	const admin = getAdminInfo(req.admin!);
	ApiResponse.ok(res, admin);
}

export { loginHandler, refreshHandler, logoutHandler, meHandler };
