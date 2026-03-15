'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { SidebarProfile } from './SidebarProfile';
import { TableOfContents } from './TableOfContents';
import { SECTIONS, type SectionConfig } from '@/lib/sections';
import { ScrollArea } from '@/ui/scroll-area';

export const Sidebar: React.FC = () => {
	const [activeSectionId, setActiveSectionId] = useState(SECTIONS[0].id);

	// Listen for scroll-spy updates (fired by ScrollContainer/useScrollSpy via URL changes)
	useEffect(() => {
		const handler = (e: CustomEvent<{ sectionId: string }>) => {
			setActiveSectionId(e.detail.sectionId);
		};
		window.addEventListener('sidebar-active-section', handler as EventListener);
		return () => window.removeEventListener('sidebar-active-section', handler as EventListener);
	}, []);

	const handleFileSelect = useCallback((section: SectionConfig) => {
		window.dispatchEvent(
			new CustomEvent('scroll-to-section', {
				detail: { sectionId: section.moduleId },
			}),
		);
	}, []);

	return (
		<div className="h-full w-full flex flex-col">
			<div className="flex items-center h-12 shrink-0 px-3 text-xs tracking-wider text-muted-foreground/70 font-semibold select-none">
				CONTENTS
			</div>

			<SidebarProfile />

			<div className="flex-1 min-h-0">
				<ScrollArea className="h-full">
					<div className="p-2">
						<TableOfContents
							items={SECTIONS}
							onSelect={handleFileSelect}
							activeSectionId={activeSectionId}
						/>
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};
