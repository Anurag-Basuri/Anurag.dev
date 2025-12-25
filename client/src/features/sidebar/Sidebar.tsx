'use client';

import React, { useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCollapsiblePanel } from '@/hooks/use-collapsible-panel';
import { SidebarProfile } from './SidebarProfile';
import { FolderTree } from './FolderTree';
import { INITIAL_FILE_SYSTEM as fileSystem, type FileSystemItem } from '@/data/filesystem';
import { resolveModuleFromSlug } from '@/lib/routes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SPRINGS } from '@/lib/constants';
import { FolderOpen } from 'lucide-react';
import { PanelHeader } from '@/components/layout/PanelHeader';
import { CollapsedPanel } from '@/components/layout/CollapsedPanel';
import { SidebarControls } from '@/components/common/WindowControls';
import { useSetAtom } from 'jotai';
import { folderExpansionSignalAtom } from '@/store';

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

	return (
		<div className="h-full w-full">
			<AnimatePresence mode="wait">
				{sidebar.isCollapsed ? (
					<CollapsedPanel
						key="collapsed-sidebar"
						type="sidebar"
						icon={FolderOpen}
						label="Explorer"
						orientation="vertical"
						onExpand={sidebar.expand}
					/>
				) : (
					<motion.div
						key="expanded-sidebar"
						initial={{ opacity: 0, scale: 0.98, y: -4, filter: 'blur(4px)' }}
						animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
						exit={{ opacity: 0, scale: 0.96, y: -4, filter: 'blur(4px)' }}
						transition={SPRINGS.normal}
						className="h-full w-full flex flex-col"
					>
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
								<motion.div
									initial="hidden"
									animate="visible"
									variants={{
										visible: {
											transition: {
												staggerChildren: 0.03,
												delayChildren: 0.05,
											},
										},
									}}
									className="p-2"
								>
									<FolderTree
										items={fileSystem}
										onSelect={handleFileSelect}
										activeModuleId={currentModule ?? null}
									/>
								</motion.div>
							</ScrollArea>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
