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
			// Server or unsupported environment
			return false;
		}
		return window.matchMedia(query).matches;
	};

	const [matches, setMatches] = useState<boolean>(getMatches);

	useEffect(() => {
		if (typeof window === 'undefined' || typeof window.matchMedia === 'undefined') return;

		const mql = window.matchMedia(query);
		const handler = (e: MediaQueryListEvent) => {
			setMatches(e.matches);
		};

		// Support older Safari
		if (typeof mql.addEventListener === 'function') {
			mql.addEventListener('change', handler as (e: MediaQueryListEvent) => void);
		} else {
			mql.addListener(handler);
		}

		// No need to setMatches here; initial state is set via getMatches

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
