'use client';

import { useCallback, useEffect, useState } from 'react';
import {
	api,
	getBackendStatus,
	getBackendLastErrorAt,
	onBackendStatusChange,
	BackendStatus,
} from '@/lib/api';

export function useBackendStatus() {
	const [status, setStatus] = useState<BackendStatus>(getBackendStatus());
	const [lastErrorAt, setLastErrorAt] = useState<number | undefined>(getBackendLastErrorAt());
	const [checking, setChecking] = useState(false);

	useEffect(() => {
		const unsubscribe = onBackendStatusChange(next => {
			setStatus(next);
			setLastErrorAt(getBackendLastErrorAt());
		});
		return () => {
			unsubscribe();
		};
	}, []);

	const refresh = useCallback(async () => {
		setChecking(true);
		try {
			await api.healthCheck();
		} catch {
			// status already handled in api
		} finally {
			setChecking(false);
		}
	}, []);

	return { status, lastErrorAt, checking, refresh };
}
