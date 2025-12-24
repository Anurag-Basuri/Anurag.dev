'use client';

import React, { useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useCollapsiblePanel } from '@/hooks/use-collapsible-panel';
import { SidebarProfile } from './SidebarProfile';
import { FolderTree } from './FolderTree';
import { CollapsedSidebar } from './CollapsedSidebar';
import { INITIAL_FILE_SYSTEM as fileSystem, type FileSystemItem } from '@/data/filesystem';
import { resolveModuleFromSlug } from '@/lib/routes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TIMINGS, TRANSITIONS } from '@/lib/constants';

export const Sidebar: React.FC = () => {
	const sidebar = useCollapsiblePanel({ type: 'sidebar' });
	const router = useRouter();
	const pathname = usePathname();

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
		<div
			className="h-full w-full transition-all"
			style={{
				opacity: sidebar.isCollapsed ? 0 : 1,
				filter: sidebar.isCollapsed ? 'blur(2px)' : 'blur(0px)',
				transitionDuration: `${TIMINGS.normal}ms`,
			}}
		>
			<AnimatePresence mode="wait">
				{sidebar.isCollapsed ? (
					<motion.div
						key="collapsed-sidebar"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={TRANSITIONS.fade}
						className="h-full w-full"
					>
						<CollapsedSidebar onExpand={sidebar.expand} />
					</motion.div>
				) : (
					<motion.div key="expanded-sidebar" className="h-full w-full flex flex-col">
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
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};
