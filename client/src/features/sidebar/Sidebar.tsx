'use client';

import React, { useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCollapsiblePanel } from '@/hooks/use-collapsible-panel';
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

export const Sidebar: React.FC = () => {
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

	// Collapsed state - minimal inline indicator
	if (sidebar.isCollapsed) {
		return (
			<button
				onClick={sidebar.expand}
				className={cn(
					'h-full w-full',
					'flex flex-col items-center justify-center gap-3 py-6',
					'bg-sidebar/40 backdrop-blur-md',
					'border-0 outline-none cursor-pointer',
					'transition-colors duration-200',
					'hover:bg-sidebar/60',
					'group',
				)}
			>
				<FolderOpen className="w-4 h-4 text-white/40 group-hover:text-emerald-400 transition-colors" />
				<span
					className="text-[10px] font-medium tracking-widest text-white/30 group-hover:text-white/60 transition-colors"
					style={{ writingMode: 'vertical-rl' }}
				>
					EXPLORER
				</span>
				<ChevronRight className="w-3 h-3 text-white/20 group-hover:text-emerald-400 transition-colors" />
			</button>
		);
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
						onMaximize={sidebar.maximize}
						onToggleFolders={() => setFolderSignal(prev => prev + 1)}
					/>
				}
			/>

			<SidebarProfile onCollapse={sidebar.collapse} onExpand={sidebar.maximize} />

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
