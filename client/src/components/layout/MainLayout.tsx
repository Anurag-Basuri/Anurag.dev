'use client';

import { useAtom } from 'jotai';
import { mainVerticalSizesAtom, mainHorizontalSizesAtom } from '@/store/atoms';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { CLI } from '@/components/os/terminal/CLI';
import { EditorArea } from '@/components/os/editor/EditorArea';
import { FolderTree } from '@/components/os/file-system/FolderTree';
import { SidebarProfile } from '@/components/os/shell/SidebarProfile';
import { initialFileSystem as fileSystem, type FileSystemItem } from '@/lib/data';
import { Taskbar } from '@/components/os/shell/Taskbar';
import { TopBar } from '@/components/os/shell/TopBar';
import { Background3D } from '@/components/os/shell/Background3D';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useWindowManager } from '@/hooks/use-window-manager';
import { useCollapsiblePanel } from '@/hooks/use-collapsible-panel';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import { CollapsedSidebar } from '@/components/os/shell/CollapsedSidebar';
import { AnimatePresence, motion } from 'framer-motion';

export function MainLayout() {
	const isMobile = useMediaQuery('(max-width: 768px)');

	const [mainVerticalSizes, setMainVerticalSizes] = useAtom(mainVerticalSizesAtom);
	const [mainHorizontalSizes, setMainHorizontalSizes] = useAtom(mainHorizontalSizesAtom);

	const [isLayoutReady] = useState(true);

	const { openWindow } = useWindowManager();

	// Use the new collapsible panel hooks
	const sidebar = useCollapsiblePanel({ type: 'sidebar' });
	const terminal = useCollapsiblePanel({ type: 'terminal' });

	const handleFileSelect = (item: FileSystemItem) => {
		if (item.type === 'file') {
			const moduleId = item.id.split('/')[0];
			openWindow(moduleId);
		}
	};

	const renderDesktopLayout = () => (
		<ResizablePanelGroup
			direction="horizontal"
			onLayout={setMainHorizontalSizes}
			className="h-full gap-1"
		>
			<ResizablePanel {...sidebar.panelProps} defaultSize={mainHorizontalSizes[0]}>
				<AnimatePresence mode="wait">
					{sidebar.isCollapsed ? (
						<motion.div
							key="collapsed-sidebar"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
							className="h-full"
						>
							<CollapsedSidebar onExpand={sidebar.expand} />
						</motion.div>
					) : (
						<motion.div
							key="expanded-sidebar"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							className="h-full rounded-sm border border-white/10 bg-[#0d1117] shadow-2xl overflow-hidden flex flex-col"
						>
							<SidebarProfile onCollapse={sidebar.collapse} />

							<div className="px-3 py-2 border-b border-white/5 text-[10px] uppercase tracking-[0.22em] text-white/40">
								Files
							</div>

							<div
								className="flex-1 overflow-auto px-2 pb-3"
								style={{
									scrollbarWidth: 'thin',
									scrollbarColor: 'rgba(255,255,255,0.1) transparent',
								}}
							>
								<FolderTree items={fileSystem} onSelect={handleFileSelect} />
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</ResizablePanel>

			<ResizableHandle withHandle className="hover:border-emerald-400/40 transition-colors" />

			<ResizablePanel defaultSize={mainHorizontalSizes[1]} minSize={30}>
				<ResizablePanelGroup
					direction="vertical"
					onLayout={setMainVerticalSizes}
					className="gap-1"
				>
					<ResizablePanel
						defaultSize={mainVerticalSizes[0]}
						minSize={40}
						className="rounded-sm border border-white/10 bg-[#0d1117]/95 backdrop-blur-xl shadow-2xl overflow-hidden"
					>
						<EditorArea />
					</ResizablePanel>

					<ResizableHandle
						withHandle
						className="hover:border-emerald-400/40 transition-colors"
					/>

					<ResizablePanel {...terminal.panelProps} defaultSize={mainVerticalSizes[1]}>
						<CLI
							onToggleCollapse={terminal.toggle}
							isCollapsed={terminal.isCollapsed}
						/>
					</ResizablePanel>
				</ResizablePanelGroup>
			</ResizablePanel>
		</ResizablePanelGroup>
	);

	const renderMobileLayout = () => (
		<div className="h-full w-full rounded-sm border border-white/10 bg-[#0d1117]/95 backdrop-blur-xl shadow-2xl overflow-hidden">
			<EditorArea />
		</div>
	);

	return (
		<ErrorBoundary>
			<div className="h-full w-full bg-background text-foreground font-mono overflow-hidden flex flex-col relative">
				<Toaster
					position="bottom-right"
					toastOptions={{
						style: {
							background: 'rgba(13, 17, 23, 0.95)',
							color: 'rgba(255, 255, 255, 0.9)',
							border: '1px solid rgba(255, 255, 255, 0.1)',
							backdropFilter: 'blur(10px)',
						},
					}}
				/>
				<Background3D />

				<TopBar
					isMobile={isMobile}
					sidebarCollapsed={sidebar.isCollapsed}
					terminalCollapsed={terminal.isCollapsed}
					onToggleSidebar={sidebar.toggle}
					onToggleTerminal={terminal.toggle}
					onFileSelect={handleFileSelect}
				/>

				<div className="flex-1 overflow-hidden p-2">
					{isLayoutReady && (isMobile ? renderMobileLayout() : renderDesktopLayout())}
				</div>

				<Taskbar />
			</div>
		</ErrorBoundary>
	);
}
