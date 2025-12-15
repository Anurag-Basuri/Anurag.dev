'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import { mainVerticalSizesAtom, mainHorizontalSizesAtom, activeWindowIdAtom } from '@/store/atoms';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { CLI } from '@/components/os/terminal/CLI';
import { EditorArea } from '@/components/os/editor/EditorArea';
import { FolderTree } from '@/components/os/file-system/FolderTree';
import { SidebarProfile } from '@/components/os/shell/SidebarProfile';
import { INITIAL_FILE_SYSTEM as fileSystem, type FileSystemItem } from '@/data/filesystem';
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
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ContextMenuProvider, useContextMenu } from '@/components/providers/context-menu-provider';
import { DesktopContextMenu } from '@/components/os/shell/DesktopContextMenu';
import { ContextMenuWrapper } from '@/components/os/shell/ContextMenuWrapper';

export function MainLayout() {
	const isMobile = useMediaQuery('(max-width: 768px)');

	const [mainVerticalSizes, setMainVerticalSizes] = useAtom(mainVerticalSizesAtom);
	const [mainHorizontalSizes, setMainHorizontalSizes] = useAtom(mainHorizontalSizesAtom);
	const [windows] = useAtom(windowsAtom);
	const [activeWindowId] = useAtom(activeWindowIdAtom);

	const [isLayoutReady] = useState(true);

	const { openWindow } = useWindowManager();

	// Use the new collapsible panel hooks
	const sidebar = useCollapsiblePanel({ type: 'sidebar' });
	const terminal = useCollapsiblePanel({ type: 'terminal' });

	// Routing Integration
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Auto-open About module on first load if no windows are open, OR sync from URL
	const hasInitialized = React.useRef(false);

	// 1. URL -> State (Initial Load & Back/Forward)
	useEffect(() => {
		if (hasInitialized.current) return;

		const appParam = searchParams.get('app');

		if (appParam) {
			// URL has an app, open it
			hasInitialized.current = true;
			// Small delay to allow hydration
			setTimeout(() => openWindow(appParam), 0);
		} else if (windows.length === 0) {
			// No URL param and no windows (fresh load), default to 'about'
			hasInitialized.current = true;
			setTimeout(() => {
				openWindow('about');
				// Also update URL to reflect this default
				router.replace(`${pathname}?app=about`);
			}, 0);
		} else {
			// Windows exist (restored from storage), but we might want to ensure URL matches active?
			// For now, mark initialized.
			hasInitialized.current = true;
		}
	}, [searchParams, windows.length, openWindow, router, pathname]);

	// 2. State -> URL (Sync active window to URL)
	useEffect(() => {
		if (!hasInitialized.current) return;

		if (activeWindowId) {
			const currentApp = searchParams.get('app');
			if (currentApp !== activeWindowId) {
				router.replace(`${pathname}?app=${activeWindowId}`);
			}
		} else {
			// No active window? Maybe clear param or leave last one?
			// Clearing it feels "correct" for an empty desktop state.
			if (searchParams.has('app')) {
				router.replace(pathname);
			}
		}
	}, [activeWindowId, router, pathname, searchParams]);

	const handleFileSelect = (item: FileSystemItem) => {
		if (item.type === 'file') {
			// Prefer explicitly defined moduleId (e.g., 'projects'), fallback to parsing ID if needed (legacy)
			const moduleId = item.moduleId || item.id.split('/')[0];
			openWindow(moduleId);
		}
	};

	const renderDesktopLayout = () => {
		if (isMobile) return null;

		if (!isLayoutReady) {
			return (
				<div className="h-full w-full flex items-center justify-center bg-background relative overflow-hidden">
					<div className="absolute inset-0 bg-linear-to-b from-primary/5 to-transparent pointer-events-none" />
					<div className="flex flex-col items-center gap-6 relative z-10">
						<div className="relative">
							<div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse" />
							<div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin relative z-10" />
							<div className="absolute inset-0 flex items-center justify-center">
								<div className="w-2 h-2 bg-primary rounded-full shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
							</div>
						</div>
						<div className="flex flex-col items-center gap-1">
							<div className="text-sm font-bold tracking-[0.2em] text-primary animate-pulse uppercase">
								System Initializing
							</div>
							<div className="text-[10px] text-muted-foreground font-mono tracking-widest">
								LOADING MODULES...
							</div>
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
								className="h-full rounded-sm border border-border/30 bg-sidebar/50 overflow-hidden flex flex-col"
							>
								<SidebarProfile onCollapse={sidebar.collapse} />

								<div className="flex-1 overflow-auto px-2 pb-3 custom-scrollbar">
									<FolderTree
										items={fileSystem}
										onSelect={handleFileSelect}
										activeModuleId={activeWindowId}
									/>
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</ResizablePanel>

				<ResizableHandle
					withHandle
					className="w-1 bg-transparent hover:bg-primary/50 transition-colors data-[resize-handle-state=hover]:bg-primary/50 data-resize-handle-active:bg-primary border-x border-border/10"
				/>

				<ResizablePanel defaultSize={mainHorizontalSizes[1]} minSize={30}>
					<ResizablePanelGroup
						direction="vertical"
						onLayout={setMainVerticalSizes}
						className="gap-1"
					>
						<ResizablePanel
							defaultSize={mainVerticalSizes[0]}
							minSize={40}
							className="rounded-sm border border-border/30 shadow-none overflow-hidden bg-transparent relative"
						>
							<EditorArea />
						</ResizablePanel>

						<ResizableHandle
							withHandle
							className="h-1 bg-transparent hover:bg-primary/50 transition-colors data-[resize-handle-state=hover]:bg-primary/50 data-resize-handle-active:bg-primary border-y border-border/10"
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
			<ContextMenuProvider>
				<ContextMenuWrapper>
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
							{isLayoutReady &&
								(isMobile ? renderMobileLayout() : renderDesktopLayout())}
						</div>

						<Taskbar />
					</div>
				</ContextMenuWrapper>
			</ContextMenuProvider>
		</ErrorBoundary>
	);
}
