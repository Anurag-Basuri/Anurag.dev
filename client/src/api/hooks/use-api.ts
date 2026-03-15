'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseApiState<T> {
	data: T | null;
	loading: boolean;
	error: string | null;
}

interface UseApiReturn<T> extends UseApiState<T> {
	refetch: () => Promise<void>;
}

// Generic data-fetching hook with loading/error state
export function useApi<T>(fetcher: () => Promise<T>): UseApiReturn<T> {
	const [state, setState] = useState<UseApiState<T>>({
		data: null,
		loading: true,
		error: null,
	});

	const fetchData = useCallback(async () => {
		setState((prev) => ({ ...prev, loading: true, error: null }));
		try {
			const data = await fetcher();
			setState({ data, loading: false, error: null });
		} catch (err) {
			const message = err instanceof Error ? err.message : 'An error occurred';
			setState({ data: null, loading: false, error: message });
		}
	}, [fetcher]);

	useEffect(() => {
		fetchData();
	}, [fetchData]);

	return { ...state, refetch: fetchData };
}

// Lazy version — doesn't fetch on mount, only on manual trigger
export function useLazyApi<T>() {
	const [state, setState] = useState<UseApiState<T>>({
		data: null,
		loading: false,
		error: null,
	});

	const execute = useCallback(async (fetcher: () => Promise<T>) => {
		setState({ data: null, loading: true, error: null });
		try {
			const data = await fetcher();
			setState({ data, loading: false, error: null });
			return data;
		} catch (err) {
			const message = err instanceof Error ? err.message : 'An error occurred';
			setState({ data: null, loading: false, error: message });
			throw err;
		}
	}, []);

	return { ...state, execute };
}

