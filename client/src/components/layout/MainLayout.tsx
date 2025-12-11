'use client';

import React, { useState, useEffect } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowManager } from '@/hooks/use-window-manager';
import { useCollapsiblePanel } from '@/hooks/use-collapsible-panel';
import { Toaster } from 'react-hot-toast';
import { CollapsedSidebar } from '@/components/os/shell/CollapsedSidebar';
import { windowsAtom, mobileSidebarOpenAtom } from '@/store/atoms';

export function MainLayout() {
	const isMobile = useMediaQuery('(max-width: 768px)');

	const [mainVerticalSizes, setMainVerticalSizes] = useAtom(mainVerticalSizesAtom);
	const [mainHorizontalSizes, setMainHorizontalSizes] = useAtom(mainHorizontalSizesAtom);
	const [windows] = useAtom(windowsAtom);

	const [isLayoutReady] = useState(true);

	const { openWindow } = useWindowManager();

	// Use the new collapsible panel hooks
	const sidebar = useCollapsiblePanel({ type: 'sidebar' });
	const terminal = useCollapsiblePanel({ type: 'terminal' });

	// Auto-open About module on first load if no windows are open
	const hasInitialized = React.useRef(false);
	useEffect(() => {
		// Only run once, and only if there's no 'about' window already
		if (!hasInitialized.current) {
			hasInitialized.current = true;
			const aboutExists = windows.some(w => w.id === 'about');
			if (!aboutExists && windows.length === 0) {
				// Small delay to ensure localStorage has hydrated
				setTimeout(() => openWindow('about'), 0);
			}
		}
	}, [windows, openWindow]);

	const handleFileSelect = (item: FileSystemItem) => {
		if (item.type === 'file') {
			const moduleId = item.id.split('/')[0];
			openWindow(moduleId);
		}
	};

	const renderDesktopLayout = () => {
		if (isMobile) return null;

		if (!isLayoutReady) {
			return (
				<div className="h-full w-full flex items-center justify-center text-muted-foreground bg-background">
					<div className="flex flex-col items-center gap-4">
						<div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
						<div className="text-sm font-mono tracking-widest animate-pulse">
							SYSTEM INITIALIZING...
						</div>
					</div>
				</div>
			);
		}

		return (
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
								className="h-full rounded-sm border border-white/10 overflow-hidden flex flex-col"
							>
								<SidebarProfile onCollapse={sidebar.collapse} />

								<div className="flex-1 overflow-auto px-2 pb-3 custom-scrollbar">
									<FolderTree items={fileSystem} onSelect={handleFileSelect} />
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</ResizablePanel>

				<ResizableHandle withHandle className="hover:border-primary/40 transition-colors" />

				<ResizablePanel defaultSize={mainHorizontalSizes[1]} minSize={30}>
					<ResizablePanelGroup
						direction="vertical"
						onLayout={setMainVerticalSizes}
						className="gap-1"
					>
						<ResizablePanel
							defaultSize={mainVerticalSizes[0]}
							minSize={40}
							className="rounded-sm border border-white/10 shadow-2xl overflow-hidden"
						>
							<EditorArea />
						</ResizablePanel>

						<ResizableHandle
							withHandle
							className="hover:border-primary/40 transition-colors"
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
	};

	const [, setIsMobileSidebarOpen] = useAtom(mobileSidebarOpenAtom);

	// Simple swipe detection
	const handlePanEnd = (event: any, info: any) => {
		if (info.offset.x > 100) {
			setIsMobileSidebarOpen(true);
		}
	};

	const renderMobileLayout = () => (
		<motion.div
			className="h-full w-full rounded-none border-none bg-[#0d1117]/60 backdrop-blur-sm shadow-none overflow-hidden relative"
			onPanEnd={handlePanEnd}
		>
			<EditorArea />
			{/* Edge swipe target area */}
			<div className="absolute top-0 bottom-0 left-0 w-8 z-50" />
		</motion.div>
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

				<div className="flex-1 overflow-hidden p-0 sm:p-1">
					{isLayoutReady && (isMobile ? renderMobileLayout() : renderDesktopLayout())}
				</div>

				<Taskbar />
			</div>
		</ErrorBoundary>
	);
}
