'use client';

import React, { useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SidebarProfile } from './SidebarProfile';
import { FolderTree } from './FolderTree';
import { INITIAL_FILE_SYSTEM as fileSystem, type FileSystemItem } from '@/data/filesystem';
import { resolveModuleFromSlug } from '@/lib/routes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderOpen } from 'lucide-react';
import { PanelHeader } from '@/components/layout/PanelHeader';
import { SidebarControls } from '@/components/common/WindowControls';
import { useSetAtom } from 'jotai';
import { folderExpansionSignalAtom } from '@/store';

// ============================================================================
// Main Sidebar Component
// ============================================================================
export const Sidebar: React.FC = () => {
	const router = useRouter();
	const pathname = usePathname();
	const setFolderSignal = useSetAtom(folderExpansionSignalAtom);

	const currentModule = useMemo(() => {
		const segments = pathname
			.split('/')
			.filter(Boolean)
			.filter(s => s !== 'portfolio');
		return resolveModuleFromSlug(segments);
	}, [pathname]);

	const handleFileSelect = useCallback(
		(item: FileSystemItem) => {
			if (item.type === 'file' && item.moduleId) {
				router.push(`/portfolio/${item.moduleId}`);
			}
		},
		[router],
	);

	return (
		<div className="h-full w-full flex flex-col">
			<PanelHeader
				type="sidebar"
				icon={FolderOpen}
				title="EXPLORER"
				controls={
					<SidebarControls onToggleFolders={() => setFolderSignal(prev => prev + 1)} />
				}
			/>

			<SidebarProfile />

			<div className="flex-1 min-h-0">
				<ScrollArea className="h-full">
					<div className="p-2">
						<FolderTree
							items={fileSystem}
							onSelect={handleFileSelect}
							activeModuleId={currentModule ?? null}
						/>
					</div>
				</ScrollArea>
			</div>
		</div>
	);
};
