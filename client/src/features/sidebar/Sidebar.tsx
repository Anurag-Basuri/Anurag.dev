'use client';

import React, { useCallback, useMemo, memo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCollapsiblePanel } from '@/hooks/use-collapsible-panel';
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

// ============================================================================
// Collapsed Sidebar View
// ============================================================================
interface CollapsedSidebarProps {
	onExpand: () => void;
}

const CollapsedSidebar = memo(function CollapsedSidebar({ onExpand }: CollapsedSidebarProps) {
	const { collapsed } = PANEL_TOKENS;

	return (
		<button
			onClick={onExpand}
			className={cn(
				'h-full w-full flex items-center justify-center gap-2',
				collapsed.bg,
				collapsed.bgHover,
				collapsed.transition,
				'group active:scale-[0.98]',
			)}
			aria-label="Expand sidebar"
		>
			<FolderOpen
				className={cn(
					PANEL_TOKENS.icons.lg,
					collapsed.iconColor,
					collapsed.iconColorHover,
					'transition-colors duration-200',
				)}
			/>
			<span
				className={cn(
					collapsed.textSize,
					collapsed.textColor,
					collapsed.textColorHover,
					'transition-colors duration-200',
				)}
			>
				Explorer
			</span>
		</button>
	);
});

// ============================================================================
// Main Sidebar Component
// ============================================================================
interface SidebarProps {
	onMaximize?: () => void;
	onCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onMaximize, onCollapse }) => {
	const sidebar = useCollapsiblePanel({ type: 'sidebar' });
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
						onClose={onCollapse ?? sidebar.collapse}
						onMaximize={onMaximize ?? sidebar.maximize}
						onToggleFolders={() => setFolderSignal(prev => prev + 1)}
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
