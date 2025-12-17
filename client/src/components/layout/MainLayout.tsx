'use client';

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useAtom } from 'jotai';
import {
	mainVerticalSizesAtom,
	mainHorizontalSizesAtom,
	activeWindowIdAtom,
	layoutStateAtom,
	bootCompleteAtom,
} from '@/store';
import { cn } from '@/lib/utils';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { INITIAL_FILE_SYSTEM as fileSystem, type FileSystemItem } from '@/data/filesystem';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { useMediaQuery } from '@/hooks/use-media-query';
import { motion, AnimatePresence } from 'framer-motion';
import { useWindowManager } from '@/hooks/use-window-manager';
import { useCollapsiblePanel } from '@/hooks/use-collapsible-panel';
import { Toaster } from 'react-hot-toast';
import { windowsAtom } from '@/store';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ContextMenuProvider } from '@/components/providers/context-menu-provider';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

// Lazy load heavy components
const CLI = lazy(() => import('@/components/os/terminal/CLI').then(mod => ({ default: mod.CLI })));
const EditorArea = lazy(() =>
	import('@/components/os/editor/EditorArea').then(mod => ({ default: mod.EditorArea })),
);
const FolderTree = lazy(() =>
	import('@/components/os/file-system/FolderTree').then(mod => ({ default: mod.FolderTree })),
);
const SidebarProfile = lazy(() =>
	import('@/components/os/shell/SidebarProfile').then(mod => ({ default: mod.SidebarProfile })),
);
const Taskbar = lazy(() =>
	import('@/components/os/shell/Taskbar').then(mod => ({ default: mod.Taskbar })),
);
const TopBar = lazy(() =>
	import('@/components/os/shell/TopBar').then(mod => ({ default: mod.TopBar })),
);
const Background3D = lazy(() =>
	import('@/components/os/shell/Background3D').then(mod => ({ default: mod.Background3D })),
);
const CollapsedSidebar = lazy(() =>
	import('@/components/os/shell/CollapsedSidebar').then(mod => ({
		default: mod.CollapsedSidebar,
	})),
);

// Lightweight loading placeholder
const ComponentLoader = ({ height = 'h-full' }: { height?: string }) => (
	<div className={cn('w-full bg-card/50 animate-pulse flex items-center justify-center', height)}>
		<div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
	</div>
);

export function MainLayout() {
	const isMobile = useMediaQuery('(max-width: 768px)');

	const [mainVerticalSizes, setMainVerticalSizes] = useAtom(mainVerticalSizesAtom);
	const [mainHorizontalSizes, setMainHorizontalSizes] = useAtom(mainHorizontalSizesAtom);
	const [windows] = useAtom(windowsAtom);
	const [activeWindowId] = useAtom(activeWindowIdAtom);
	const [layoutState, setLayoutState] = useAtom(layoutStateAtom);
	const [bootComplete] = useAtom(bootCompleteAtom);

	const [isLayoutReady, setIsLayoutReady] = useState(false);
	const [hasInitialized, setHasInitialized] = useState(false);

	const { openWindow } = useWindowManager();
	const sidebar = useCollapsiblePanel({ type: 'sidebar' });
	const terminal = useCollapsiblePanel({ type: 'terminal' });

	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// Progressive layout initialization
	useEffect(() => {
		if (!bootComplete) return;

		const timer = setTimeout(() => {
			setIsLayoutReady(true);
		}, 50); // Small delay for smooth transition

		return () => clearTimeout(timer);
	}, [bootComplete]);

	// URL -> State: Sync window from URL or open default
	useEffect(() => {
		if (hasInitialized || !bootComplete || !isLayoutReady) return;

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

		const timer = setTimeout(() => setHasInitialized(true), 0);
		return () => clearTimeout(timer);
	}, [
		searchParams,
		windows,
		openWindow,
		router,
		pathname,
		hasInitialized,
		bootComplete,
		isLayoutReady,
	]);

	// State -> URL: Sync active window changes to URL
	useEffect(() => {
		if (!hasInitialized) return;

		if (activeWindowId) {
			const currentApp = searchParams.get('app');
			if (currentApp !== activeWindowId) {
				router.replace(`${pathname}?app=${activeWindowId}`, { scroll: false });
			}
		} else if (searchParams.has('app')) {
			router.replace(pathname, { scroll: false });
		}
	}, [activeWindowId, pathname, router, searchParams, hasInitialized]);

	// Keyboard shortcuts
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
				const terminalInput = document.querySelector<HTMLInputElement>(
					'input[aria-label="Command input"]',
				);
				terminalInput?.focus();
			},
			description: 'Focus terminal',
		},
	]);

	const handleFileSelect = useCallback(
		(item: FileSystemItem) => {
			if (item.type === 'file') {
				const moduleId = item.moduleId || item.id.split('/')[0];
				openWindow(moduleId);
			}
		},
		[openWindow],
	);

	// Show minimal loading state
	if (!isLayoutReady) {
		return (
			<div className="h-screen w-screen flex items-center justify-center bg-background relative overflow-hidden">
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

	const renderDesktopLayout = () => {
		if (isMobile) return null;

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
				className="h-full gap-1"
			>
				<ResizablePanel
					{...sidebar.panelProps}
					defaultSize={mainHorizontalSizes[0]}
					className={cn(
						'overflow-hidden bg-card/80',
						sidebar.isCollapsed ? '' : 'border border-border',
					)}
				>
					<Suspense fallback={<ComponentLoader />}>
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
					</Suspense>
				</ResizablePanel>

				<ResizableHandle
					withHandle
					className="w-[2px] bg-border data-[resize-handle-state=hover]:bg-primary/80 data-[resize-handle-state=drag]:bg-primary"
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
						className="h-full gap-1"
					>
						<ResizablePanel
							defaultSize={mainVerticalSizes[0]}
							minSize={40}
							className="overflow-hidden border border-border bg-card/80"
						>
							<Suspense fallback={<ComponentLoader />}>
								<EditorArea />
							</Suspense>
						</ResizablePanel>

						<ResizableHandle
							withHandle
							className="h-[2px] bg-border data-[resize-handle-state=hover]:bg-primary/80 data-[resize-handle-state=drag]:bg-primary"
						/>

						<ResizablePanel
							{...terminal.panelProps}
							defaultSize={mainVerticalSizes[1]}
							className="overflow-hidden border border-border bg-card/80"
						>
							<Suspense fallback={<ComponentLoader height="h-32" />}>
								<CLI
									onToggleCollapse={terminal.collapse}
									isCollapsed={terminal.isCollapsed}
									onMaximize={terminal.maximize}
									onMinimize={terminal.collapse}
									onClose={terminal.collapse}
								/>
							</Suspense>
						</ResizablePanel>
					</ResizablePanelGroup>
				</ResizablePanel>
			</ResizablePanelGroup>
		);
	};

	const renderMobileLayout = () => {
		if (!isMobile) return null;

		return (
			<div className="h-full flex flex-col overflow-hidden">
				<div className="flex-1 overflow-hidden border border-border bg-card/80">
					<Suspense fallback={<ComponentLoader />}>
						<EditorArea />
					</Suspense>
				</div>
				<div className="h-[40vh] overflow-hidden border-t border-border bg-card/80">
					<Suspense fallback={<ComponentLoader height="h-32" />}>
						<CLI
							onToggleCollapse={terminal.collapse}
							isCollapsed={terminal.isCollapsed}
						/>
					</Suspense>
				</div>
			</div>
		);
	};

	return (
		<ErrorBoundary>
			<ContextMenuProvider>
				<div className="h-screen w-screen flex flex-col overflow-hidden bg-background relative">
					{/* Background */}
					<Suspense fallback={null}>
						<Background3D />
					</Suspense>

					{/* Top Bar */}
					<Suspense fallback={<ComponentLoader height="h-8" />}>
						<TopBar
							isMobile={isMobile}
							sidebarCollapsed={sidebar.isCollapsed}
							terminalCollapsed={terminal.isCollapsed}
							onToggleSidebar={
								sidebar.isCollapsed ? sidebar.expand : sidebar.collapse
							}
							onToggleTerminal={
								terminal.isCollapsed ? terminal.expand : terminal.collapse
							}
							onFileSelect={handleFileSelect}
						/>
					</Suspense>

					{/* Main Content */}
					<div className="flex-1 min-h-0 overflow-hidden relative z-10">
						{renderDesktopLayout()}
						{renderMobileLayout()}
					</div>

					{/* Taskbar */}
					<Suspense fallback={<ComponentLoader height="h-9" />}>
						<Taskbar />
					</Suspense>

					{/* Toast Notifications */}
					<Toaster
						position="top-right"
						toastOptions={{
							duration: 3000,
							style: {
								background: 'var(--background)',
								color: 'var(--foreground)',
								border: '1px solid var(--border)',
							},
						}}
					/>
				</div>
			</ContextMenuProvider>
		</ErrorBoundary>
	);
}
