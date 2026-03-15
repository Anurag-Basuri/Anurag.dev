'use client';

import { ScrollContainer } from '@/layout/ScrollContainer';

interface PortfolioContentProps {
	initialSection?: string;
}

/**
 * Client component that renders the scroll container.
 * The initialSection prop comes from the URL slug.
 */
export function PortfolioContent({ initialSection }: PortfolioContentProps) {
	return <ScrollContainer initialSection={initialSection} />;
}
