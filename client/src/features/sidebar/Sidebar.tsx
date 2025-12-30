'use client';

import React, { useCallback, useMemo, memo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SidebarProfile } from './SidebarProfile';
import { FolderTree } from './FolderTree';
import { INITIAL_FILE_SYSTEM as fileSystem, type FileSystemItem } from '@/data/filesystem';
import { resolveModuleFromSlug } from '@/lib/routes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderOpen, ChevronRight } from 'lucide-react';
import { PanelHeader } from '@/components/layout/PanelHeader';
import { SidebarControls } from '@/components/common/WindowControls';
import { useSetAtom } from 'jotai';
import { folderExpansionSignalAtom } from '@/store';
import { cn } from '@/lib/utils';
import { PANEL_TOKENS } from '@/lib/constants';
import { usePanelControls } from '@/contexts/panel-context';

// ============================================================================
// Collapsed Sidebar View - Premium Design
// ============================================================================
interface CollapsedSidebarProps {
	onExpand: () => void;
}

const CollapsedSidebar = memo(function CollapsedSidebar({ onExpand }: CollapsedSidebarProps) {
	return (
		<button
			onClick={onExpand}
			className="h-full w-full relative group overflow-hidden"
			aria-label="Expand sidebar"
		>
			{/* Glassmorphism background */}
			<div className="absolute inset-0 bg-linear-to-br from-zinc-900/80 via-zinc-900/60 to-zinc-800/40 backdrop-blur-xl" />

			{/* Animated gradient border */}
			<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
				<div className="absolute inset-0 bg-linear-to-br from-emerald-500/20 via-transparent to-emerald-500/10" />
				<div className="absolute inset-px bg-zinc-900/90 backdrop-blur-xl rounded-sm" />
			</div>

			{/* Subtle glow effect on hover */}
			<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full" />
			</div>

			{/* Content */}
			<div className="relative h-full flex items-center justify-center gap-3 px-4">
				{/* Icon with glow */}
				<div className="relative">
					<FolderOpen
						className={cn(
							'w-5 h-5 text-white/40 group-hover:text-emerald-400 transition-all duration-300',
							'group-hover:drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]',
						)}
					/>
				</div>

				{/* Label */}
				<span className="text-xs font-medium tracking-wide text-white/40 group-hover:text-white/80 transition-colors duration-300 uppercase">
					Explorer
				</span>

				{/* Expand indicator */}
				<div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
					<ChevronRight className="w-4 h-4 text-emerald-400/60" />
				</div>
			</div>

			{/* Bottom accent line */}
			<div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
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
