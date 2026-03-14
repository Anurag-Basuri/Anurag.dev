import { apiClient } from '@/lib/api-client';
import type { AuthTokens } from '@/types/api';

// Auth API service

interface AdminInfo {
	adminId: string;
	role: string;
}

async function login(username: string, password: string): Promise<AuthTokens> {
	return apiClient.post<AuthTokens>('/auth/login', { username, password });
}

async function refresh(refreshToken: string): Promise<AuthTokens> {
	return apiClient.post<AuthTokens>('/auth/refresh', { refreshToken });
}

async function logout(): Promise<null> {
	return apiClient.post<null>('/auth/logout', {}, true);
}

async function getMe(): Promise<AdminInfo> {
	return apiClient.get<AdminInfo>('/auth/me', true);
}

export const authService = {
	login,
	refresh,
	logout,
	getMe,
};

export type { AdminInfo };
