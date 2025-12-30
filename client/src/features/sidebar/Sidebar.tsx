'use client';

import React, { useCallback, useMemo, memo } from 'react';
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
import { cn } from '@/lib/utils';
import { PANEL_TOKENS } from '@/lib/constants';
import { usePanelControls } from '@/contexts/panel-context';

// ============================================================================
// Collapsed Sidebar View
// ============================================================================
interface CollapsedSidebarProps {
	onExpand: () => void;
}

const CollapsedSidebar = memo(function CollapsedSidebar({ onExpand }: CollapsedSidebarProps) {
	return (
		<button
			onClick={onExpand}
			className="h-full w-full flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 transition-colors duration-200 group"
			aria-label="Expand sidebar"
		>
			<FolderOpen className="w-4 h-4 text-white/30 group-hover:text-emerald-400 transition-colors duration-200" />
			<span className="text-xs font-mono text-white/30 group-hover:text-white/60 transition-colors duration-200">
				Explorer
			</span>
		</button>
	);
});

// ============================================================================
// Main Sidebar Component
// ============================================================================
export const Sidebar: React.FC = () => {
	const { sidebar } = usePanelControls();
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

	// Collapsed state - matches terminal's collapsed design
	if (sidebar.isCollapsed) {
		return <CollapsedSidebar onExpand={sidebar.expand} />;
	}

	// Expanded state
	return (
		<div className="h-full w-full flex flex-col">
			<PanelHeader
				type="sidebar"
				icon={FolderOpen}
				title="EXPLORER"
				controls={
					<SidebarControls
						onClose={sidebar.collapse}
						onMaximize={sidebar.toggleMaximize}
						onToggleFolders={() => setFolderSignal(prev => prev + 1)}
						isMaximized={sidebar.isMaximized}
					/>
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
