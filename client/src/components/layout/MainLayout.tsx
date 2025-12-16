'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAtom } from 'jotai';
import {
	mainVerticalSizesAtom,
	mainHorizontalSizesAtom,
	activeWindowIdAtom,
	layoutStateAtom,
} from '@/store';
import { cn } from '@/lib/utils';
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
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useWindowManager } from '@/hooks/use-window-manager';
import { useCollapsiblePanel } from '@/hooks/use-collapsible-panel';
import { Toaster } from 'react-hot-toast';
import { CollapsedSidebar } from '@/components/os/shell/CollapsedSidebar';
import { windowsAtom, mobileSidebarOpenAtom } from '@/store';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ContextMenuProvider, useContextMenu } from '@/components/providers/context-menu-provider';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

export function MainLayout() {
	const isMobile = useMediaQuery('(max-width: 768px)');

	const [mainVerticalSizes, setMainVerticalSizes] = useAtom(mainVerticalSizesAtom);
	const [mainHorizontalSizes, setMainHorizontalSizes] = useAtom(mainHorizontalSizesAtom);
	const [windows] = useAtom(windowsAtom);
	const [activeWindowId] = useAtom(activeWindowIdAtom);
	const [layoutState, setLayoutState] = useAtom(layoutStateAtom);

	const [isLayoutReady] = useState(true);

	const { openWindow } = useWindowManager();

	// Use the new collapsible panel hooks
	const sidebar = useCollapsiblePanel({ type: 'sidebar' });
	const terminal = useCollapsiblePanel({ type: 'terminal' });

	// Routing Integration
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// URL -> State: Sync window from URL or open default
	useEffect(() => {
		const appParam = searchParams.get('app');

		if (appParam) {
			const alreadyOpen = windows.some(w => w.id === appParam);
			if (!alreadyOpen) {
				openWindow(appParam);
			}
		} else if (windows.length === 0) {
			openWindow('about');
			router.replace(`${pathname}?app=about`, { scroll: false });
		}
	}, [searchParams, windows, openWindow, router, pathname]);

	// State -> URL: Sync active window changes to URL
	useEffect(() => {
		if (activeWindowId) {
			const currentApp = searchParams.get('app');
			if (currentApp !== activeWindowId) {
				router.replace(`${pathname}?app=${activeWindowId}`, { scroll: false });
			}
		} else if (searchParams.has('app')) {
			router.replace(pathname, { scroll: false });
		}
	}, [activeWindowId, pathname, router, searchParams]);

	const handleFileSelect = (item: FileSystemItem) => {
		if (item.type === 'file') {
			const moduleId = item.moduleId || item.id.split('/')[0];
			openWindow(moduleId);
		}
	};

	// Layout Rendering
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
				onLayout={layout => {
					setMainHorizontalSizes(layout);
					setLayoutState(prev => ({
						...prev,
						main: { ...prev.main, horizontal: layout },
						sidebar: { ...prev.sidebar, size: layout[0] },
					}));
				}}
				className="h-full"
			>
				<ResizablePanel
					{...sidebar.panelProps}
					defaultSize={mainHorizontalSizes[0]}
					className="overflow-hidden"
				>
					<div
						className={cn(
							'h-full w-full rounded-sm overflow-hidden flex flex-col transition-all duration-300',
							sidebar.isCollapsed
								? 'border-none'
								: 'border-2 border-white/50 shadow-xl',
						)}
					>
						<AnimatePresence mode="wait">
							{sidebar.isCollapsed ? (
								<motion.div
									key="collapsed-sidebar"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.15 }}
									className="h-full bg-sidebar/50"
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
									className="h-full bg-sidebar/50 flex flex-col"
								>
									<SidebarProfile
										onCollapse={sidebar.collapse}
										onExpand={sidebar.maximize}
									/>

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
					</div>
				</ResizablePanel>

				<ResizableHandle
					withHandle
					className="w-1.5 bg-transparent hover:bg-primary/20 active:bg-primary/40 transition-colors z-50 rounded-full"
				/>

				<ResizablePanel defaultSize={mainHorizontalSizes[1]} minSize={30}>
					<ResizablePanelGroup
						direction="vertical"
						onLayout={layout => {
							setMainVerticalSizes(layout);
							setLayoutState(prev => ({
								...prev,
								main: { ...prev.main, vertical: layout },
								terminal: { ...prev.terminal, size: layout[1] },
							}));
						}}
						className="h-full gap-0.5"
					>
						<ResizablePanel
							defaultSize={mainVerticalSizes[0]}
							minSize={40}
							className="overflow-hidden relative"
						>
							<div className="h-full w-full rounded-sm border-2 border-white/50 overflow-hidden relative shadow-2xl">
								<EditorArea />
							</div>
						</ResizablePanel>

						<ResizableHandle
							withHandle
							className="h-1.5 bg-transparent hover:bg-primary/20 active:bg-primary/40 transition-colors z-50 rounded-full"
						/>

						<ResizablePanel
							{...terminal.panelProps}
							defaultSize={mainVerticalSizes[1]}
							className="overflow-hidden"
						>
							<div
								className={cn(
									'h-full w-full rounded-sm overflow-hidden transition-all duration-300',
									terminal.isCollapsed
										? 'border-none'
										: 'border-2 border-white/50 shadow-xl',
								)}
							>
								<CLI
									onToggleCollapse={terminal.toggle}
									isCollapsed={terminal.isCollapsed}
									onMaximize={terminal.maximize}
									onMinimize={terminal.collapse}
									onClose={terminal.collapse}
								/>
							</div>
						</ResizablePanel>
					</ResizablePanelGroup>
				</ResizablePanel>
			</ResizablePanelGroup>
		);
	};

	const [, setIsMobileSidebarOpen] = useAtom(mobileSidebarOpenAtom);

	const handlePanEnd = (event: MouseEvent | TouchEvent, info: PanInfo) => {
		if (info.offset.x > 100) {
			setIsMobileSidebarOpen(true);
		}
	};

	const renderMobileLayout = () => (
		<div className="relative h-full w-full overflow-hidden">
			{/* Editor Area (Full Screen) */}
			<div className="absolute inset-0 z-0">
				<EditorArea />
			</div>

			{/* Mobile Terminal Overlay */}
			<AnimatePresence>
				{!terminal.isCollapsed && (
					<motion.div
						initial={{ y: '100%' }}
						animate={{ y: 0 }}
						exit={{ y: '100%' }}
						transition={{ type: 'spring', damping: 25, stiffness: 200 }}
						className="absolute inset-x-0 bottom-0 h-[45vh] z-40 bg-zinc-950/95 backdrop-blur-xl border-t border-white/10 shadow-2xl rounded-t-xl overflow-hidden flex flex-col"
					>
						<div className="flex-1 overflow-hidden relative">
							<CLI
								onToggleCollapse={terminal.toggle}
								isCollapsed={false}
								onMaximize={terminal.toggle}
								onMinimize={terminal.toggle}
								onClose={terminal.toggle}
							/>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Edge swipe target area for Sidebar */}
			<motion.div
				className="absolute top-0 bottom-0 left-0 w-8 z-30"
				onPanEnd={handlePanEnd}
			/>
		</div>
	);

	useKeyboardShortcuts([
		{
			key: 'b',
			ctrl: true,
			handler: () => {
				if (sidebar.isCollapsed) {
					sidebar.expand();
				} else {
					sidebar.collapse();
				}
			},
			description: 'Toggle sidebar',
		},
		{
			key: '`',
			ctrl: true,
			handler: () => {
				if (terminal.isCollapsed) {
					terminal.expand();
				} else {
					terminal.collapse();
				}
			},
			description: 'Toggle terminal',
		},
		{
			key: 'k',
			ctrl: true,
			shift: true,
			handler: () => {
				// Focus terminal input
				const terminalInput = document.querySelector<HTMLInputElement>(
					'input[aria-label="Command input"]',
				);
				terminalInput?.focus();
			},
			description: 'Focus terminal',
		},
	]);

	return (
		<ErrorBoundary>
			<ContextMenuProvider>
				<Background3D />

				<div className="h-full w-full bg-background text-foreground font-mono overflow-hidden flex flex-col relative z-10">
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

					<TopBar
						isMobile={isMobile}
						sidebarCollapsed={sidebar.isCollapsed}
						terminalCollapsed={terminal.isCollapsed}
						onToggleSidebar={sidebar.toggle}
						onToggleTerminal={terminal.toggle}
						onFileSelect={handleFileSelect}
					/>

					<div className="flex-1 overflow-hidden p-1">
						{isLayoutReady && (isMobile ? renderMobileLayout() : renderDesktopLayout())}
					</div>

					<Taskbar />
				</div>
			</ContextMenuProvider>
		</ErrorBoundary>
	);
}
