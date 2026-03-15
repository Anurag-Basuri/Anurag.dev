'use client';

import { useRef, useEffect, Suspense, useMemo, type ReactNode } from 'react';
import { SECTIONS } from '@/lib/sections';
import { getModuleComponent } from '@/lib/moduleRegistry';
import { useScrollSpy } from './useScrollSpy';
import { useScrollNavigation } from './useScrollNavigation';
import { ScrollSection } from './ScrollSection';
import { ScrollIndicator } from './ScrollIndicator';
import { ModuleLoader } from '@/ui/Loader';

interface ScrollContainerProps {
	/** Initial section to scroll to on mount (from URL slug) */
	initialSection?: string;
	children?: ReactNode;
}

/**
 * The main scroll container that renders all portfolio sections vertically
 * with snap scrolling. This replaces the single-module-at-a-time routing.
 */
export function ScrollContainer({ initialSection }: ScrollContainerProps) {
	const containerRef = useRef<HTMLDivElement>(null);
	const { activeSectionId, suppressSpy } = useScrollSpy(containerRef);
	const { scrollTo } = useScrollNavigation(containerRef, suppressSpy);
	const hasScrolledToInitial = useRef(false);

	// Scroll to initial section on mount (for deep links like /portfolio/projects)
	useEffect(() => {
		if (!initialSection || initialSection === SECTIONS[0].id || hasScrolledToInitial.current)
			return;
		hasScrolledToInitial.current = true;

		// Small delay to let sections render
		const timeout = setTimeout(() => {
			scrollTo(initialSection, 'instant' as ScrollBehavior);
		}, 100);

		return () => clearTimeout(timeout);
	}, [initialSection, scrollTo]);

	// Expose scrollTo for external consumers (sidebar, terminal)
	useEffect(() => {
		const handler = (e: CustomEvent<{ sectionId: string }>) => {
			scrollTo(e.detail.sectionId);
		};
		window.addEventListener('scroll-to-section', handler as EventListener);
		return () => window.removeEventListener('scroll-to-section', handler as EventListener);
	}, [scrollTo]);

	// Pre-build section components so they don't re-render on scroll
	const sectionComponents = useMemo(
		() =>
			SECTIONS.map(section => ({
				...section,
				component: getModuleComponent(section.moduleId),
			})),
		[],
	);

	return (
		<div className="relative h-full w-full">
			{/* Scroll indicator (side dots) */}
			<ScrollIndicator activeSectionId={activeSectionId} onSectionClick={scrollTo} />

			{/* Scrollable container */}
			<div
				ref={containerRef}
				className="h-full w-full overflow-y-auto overflow-x-hidden scroll-smooth"
				style={{
					scrollSnapType: 'y proximity',
					scrollBehavior: 'smooth',
				}}
			>
				{sectionComponents.map(section => (
					<ScrollSection key={section.id} id={section.id}>
						<Suspense
							fallback={<ModuleLoader message={`Loading ${section.label}...`} />}
						>
							{section.component}
						</Suspense>
					</ScrollSection>
				))}
			</div>
		</div>
	);
}
