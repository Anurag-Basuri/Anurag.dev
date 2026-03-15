'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { SECTIONS } from '@/lib/sections';

/**
 * Tracks which section is currently in view using IntersectionObserver.
 * Updates the URL via replaceState as the user scrolls.
 */
export function useScrollSpy(containerRef: React.RefObject<HTMLElement | null>) {
	const [activeSectionId, setActiveSectionId] = useState(SECTIONS[0].id);
	const observerRef = useRef<IntersectionObserver | null>(null);
	const isManualScrollRef = useRef(false);
	const manualScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Suppress spy during programmatic scrolls
	const suppressSpy = useCallback((durationMs = 800) => {
		isManualScrollRef.current = true;
		if (manualScrollTimeoutRef.current) clearTimeout(manualScrollTimeoutRef.current);
		manualScrollTimeoutRef.current = setTimeout(() => {
			isManualScrollRef.current = false;
		}, durationMs);
	}, []);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		// Find all section elements
		const sectionEls = SECTIONS.map(s => document.getElementById(`section-${s.id}`)).filter(
			Boolean,
		) as HTMLElement[];

		if (sectionEls.length === 0) return;

		observerRef.current = new IntersectionObserver(
			entries => {
				if (isManualScrollRef.current) return;

				// Find the most visible section
				let bestEntry: IntersectionObserverEntry | null = null;
				for (const entry of entries) {
					if (
						entry.isIntersecting &&
						(!bestEntry || entry.intersectionRatio > bestEntry.intersectionRatio)
					) {
						bestEntry = entry;
					}
				}

				if (bestEntry) {
					const id = bestEntry.target.id.replace('section-', '');
					setActiveSectionId(id);

					// Update URL without navigation
					const url = id === SECTIONS[0].id ? '/portfolio' : `/portfolio/${id}`;
					window.history.replaceState(null, '', url);
				}
			},
			{
				root: container,
				threshold: [0.3, 0.5, 0.7],
				rootMargin: '-10% 0px -10% 0px',
			},
		);

		for (const el of sectionEls) {
			observerRef.current.observe(el);
		}

		return () => {
			observerRef.current?.disconnect();
			if (manualScrollTimeoutRef.current) clearTimeout(manualScrollTimeoutRef.current);
		};
	}, [containerRef]);

	return { activeSectionId, suppressSpy };
}

