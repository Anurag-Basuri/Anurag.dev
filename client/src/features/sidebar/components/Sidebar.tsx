'use client';

import React, { useCallback, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarProfile } from './SidebarProfile';
import { TableOfContents } from './TableOfContents';
import { INITIAL_FILE_SYSTEM as fileSystem, type FileSystemItem } from '@/lib/filesystem';
import { ScrollArea } from '@/components/ui/scroll-area';

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

	const handleFileSelect = useCallback((item: FileSystemItem) => {
		if (item.type === 'file' && item.moduleId) {
			window.dispatchEvent(
				new CustomEvent('scroll-to-section', {
					detail: { sectionId: item.moduleId },
				}),
			);
		}
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
							items={fileSystem}
							onSelect={handleFileSelect}
							activeSectionId={currentModule}
						/>
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};

