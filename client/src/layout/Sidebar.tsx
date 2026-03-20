'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { SidebarProfile } from './SidebarProfile';
import { TableOfContents } from './TableOfContents';
import { SECTIONS, type SectionConfig } from '@/lib/sections';
import { ScrollArea } from '@/ui/scroll-area';
import { cn } from '@/lib/utils';

export const Sidebar: React.FC<{ isCollapsed?: boolean }> = ({ isCollapsed }) => {
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
			<SidebarProfile isCollapsed={isCollapsed} />

			<div className="flex-1 min-h-0">
				<ScrollArea className="h-full">
					<div className={cn("p-2", isCollapsed ? "h-full flex flex-col justify-center min-h-full" : "")}>
						<TableOfContents
							items={SECTIONS}
							onSelect={handleFileSelect}
							activeSectionId={activeSectionId}
							isCollapsed={isCollapsed}
						/>
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};
