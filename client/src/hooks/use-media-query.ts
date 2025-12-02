'use client';

import { useEffect, useState } from 'react';

/**
 * SSR-safe media query hook.
 * - Returns false on the server to avoid hydration mismatches
 * - Subscribes/unsubscribes to media query changes in the browser
 */
export function useMediaQuery(query: string): boolean {
	const getMatches = () => {
		if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') {
			return false;
		}
		return window.matchMedia(query).matches;
	};

	const [matches, setMatches] = useState<boolean>(getMatches);

	useEffect(() => {
		if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') return;

		const mql = window.matchMedia(query);
		const handler = (e: MediaQueryListEvent | MediaQueryList) => {
			// Normalize for legacy API
			const next = 'matches' in e ? e.matches : (e as MediaQueryList).matches;
			setMatches(next);
		};

		// Subscribe to media query changes
		if (typeof mql.addEventListener === 'function') {
			mql.addEventListener('change', handler as (e: MediaQueryListEvent) => void);
		} else {
			mql.addListener(handler);
		}

		return () => {
			if (typeof mql.removeEventListener === 'function') {
				mql.removeEventListener('change', handler as (e: MediaQueryListEvent) => void);
			} else {
				mql.removeListener(handler);
			}
		};
	}, [query]);

	return matches;
}
