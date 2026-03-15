'use client';

import { useCallback, useRef } from 'react';

/**
 * Provides programmatic scrolling to any section by ID.
 * Call `scrollTo(sectionId)` from sidebar, terminal, or any other navigation source.
 */
export function useScrollNavigation(
	containerRef: React.RefObject<HTMLElement | null>,
	suppressSpy?: (durationMs?: number) => void,
) {
	const scrollingRef = useRef(false);

	const scrollTo = useCallback(
		(sectionId: string, behavior: ScrollBehavior = 'smooth') => {
			const container = containerRef.current;
			const target = document.getElementById(`section-${sectionId}`);
			if (!container || !target) return;

			// Suppress scroll spy to avoid URL flickering
			suppressSpy?.(1200);
			scrollingRef.current = true;

			target.scrollIntoView({ behavior, block: 'start' });

			// Update URL immediately
			const url = sectionId === 'about' ? '/portfolio' : `/portfolio/${sectionId}`;
			window.history.replaceState(null, '', url);

			// Reset scrolling flag after animation completes
			setTimeout(() => {
				scrollingRef.current = false;
			}, behavior === 'smooth' ? 1000 : 100);
		},
		[containerRef, suppressSpy],
	);

	return { scrollTo, isScrolling: scrollingRef.current };
}

