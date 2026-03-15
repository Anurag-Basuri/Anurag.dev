'use client';

import React, { useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProfile } from './SidebarProfile';
import { TableOfContents } from './TableOfContents';
import { SECTIONS, type SectionConfig } from '@/lib/sections';
import { ScrollArea } from '@/ui/scroll-area';

// ============================================================================
// Main Sidebar Component
// ============================================================================
export const Sidebar: React.FC = () => {
	const pathname = usePathname();

	const currentModule = useMemo(() => {
		const segments = pathname
			.split('/')
			.filter(Boolean)
			.filter(s => s !== 'portfolio');
		return segments[0] || 'about';
	}, [pathname]);

	const handleFileSelect = useCallback((section: SectionConfig) => {
		window.dispatchEvent(
			new CustomEvent('scroll-to-section', {
				detail: { sectionId: section.moduleId },
			}),
		);
	}, []);

	return (
		<div className="h-full w-full flex flex-col">
			<div className="flex items-center h-full px-3 text-xs tracking-wider text-muted-foreground/70 font-semibold select-none">
				CONTENTS
			</div>

			<SidebarProfile />

			<div className="flex-1 min-h-0">
				<ScrollArea className="h-full">
					<div className="p-2">
						<TableOfContents
							items={SECTIONS}
							onSelect={handleFileSelect}
							activeSectionId={currentModule}
						/>
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};
