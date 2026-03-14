'use client';

import { useCallback, useEffect } from 'react';
import { useAtom } from 'jotai';
import { accessTokenAtom, refreshTokenAtom, isAuthenticatedAtom } from '../store/auth';
import { setTokenStore } from '../client';
import { authService } from '../services/auth';
import type { AdminInfo } from '../services/auth';

export function useAuth() {
	const [accessToken, setAccessToken] = useAtom(accessTokenAtom);
	const [refreshToken, setRefreshToken] = useAtom(refreshTokenAtom);
	const [isAuthenticated] = useAtom(isAuthenticatedAtom);

	// Wire the token store so api client can read/write tokens
	useEffect(() => {
		setTokenStore({
			getAccess: () => accessToken,
			getRefresh: () => refreshToken,
			setTokens: (access: string, refresh: string) => {
				setAccessToken(access);
				setRefreshToken(refresh);
			},
			clearTokens: () => {
				setAccessToken(null);
				setRefreshToken(null);
			},
		});
	}, [accessToken, refreshToken, setAccessToken, setRefreshToken]);

	const login = useCallback(
		async (username: string, password: string) => {
			const tokens = await authService.login(username, password);
			setAccessToken(tokens.accessToken);
			setRefreshToken(tokens.refreshToken);
			return tokens;
		},
		[setAccessToken, setRefreshToken],
	);

	const logout = useCallback(async () => {
		try {
			await authService.logout();
		} catch {
			// Stateless — just clear locally
		}
		setAccessToken(null);
		setRefreshToken(null);
	}, [setAccessToken, setRefreshToken]);

	const refresh = useCallback(async () => {
		if (!refreshToken) throw new Error('No refresh token');
		const tokens = await authService.refresh(refreshToken);
		setAccessToken(tokens.accessToken);
		setRefreshToken(tokens.refreshToken);
		return tokens;
	}, [refreshToken, setAccessToken, setRefreshToken]);

	const getMe = useCallback(async (): Promise<AdminInfo> => {
		return authService.getMe();
	}, []);

	return {
		isAuthenticated,
		accessToken,
		login,
		logout,
		refresh,
		getMe,
	};
}
