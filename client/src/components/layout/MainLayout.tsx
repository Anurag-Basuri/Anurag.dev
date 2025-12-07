'use client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderTree } from '@/components/features/file-system/FolderTree';
import { SidebarProfile } from '@/components/layout/SidebarProfile';
import { Taskbar } from '@/components/layout/Taskbar';
import { TopBar } from '@/components/layout/TopBar';

import { CLI } from '@/components/features/terminal/CLI';
import { initialFileSystem, FileSystemItem } from '@/lib/data';
import { useAtom } from 'jotai';
import { windowsAtom, activeWindowIdAtom } from '@/store/atoms';
import { getModuleComponent } from '@/lib/moduleRegistry';
import { EditorArea } from '@/components/features/editor/EditorArea';
import { Toaster } from 'react-hot-toast';
import { ErrorBoundary } from '@/components/shared/ErrorBoundary';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-media-query';
import { PanelLeftClose, Terminal as TerminalIcon, ChevronDown } from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import type { ImperativePanelHandle } from 'react-resizable-panels';
import Background3D from '@/components/layout/Background3D';
import { WelcomeDialog } from '@/components/shared/WelcomeDialog';
import { HelpButton } from '@/components/shared/HelpButton';

// Persistent size helper
function usePersistentSizes(key: string, initial: number[]) {
	const [sizes, setSizes] = useState<number[]>(initial);
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		try {
			const raw = localStorage.getItem(key);
			if (raw) {
				const parsed = JSON.parse(raw);
				if (Array.isArray(parsed) && parsed.every(n => typeof n === 'number')) {
					setSizes(parsed);
				}
			}
		} catch {}
		setIsHydrated(true);
	}, [key]);

	const onLayout = useCallback(
		(next: number[]) => {
			setSizes(next);
			try {
				localStorage.setItem(key, JSON.stringify(next));
			} catch {}
		},
		[key],
	);

	return { sizes, onLayout, isHydrated };
}

export function MainLayout() {
	const [windows, setWindows] = useAtom(windowsAtom);
	const [activeWindowId, setActiveWindowId] = useAtom(activeWindowIdAtom);
	const isMobile = useMediaQuery('(max-width: 768px)');

	// Track client-side mount
	const [isMounted, setIsMounted] = useState(false);
	useEffect(() => {
		setIsMounted(true);
	}, []);

	const sidebarRef = useRef<ImperativePanelHandle>(null);
	const terminalRef = useRef<ImperativePanelHandle>(null);

	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	// Default to collapsed for simplicity
	const [terminalCollapsed, setTerminalCollapsed] = useState(true);

	const {
		sizes: verticalSizes,
		onLayout: onVerticalLayout,
		isHydrated: vHydrated,
	} = usePersistentSizes('layout:v', [100, 0]);
	const {
		sizes: horizontalSizes,
		onLayout: onHorizontalLayout,
		isHydrated: hHydrated,
	} = usePersistentSizes('layout:h', [20, 80]);

	const isLayoutReady = isMounted && vHydrated && hHydrated;

	const handleFileSelect = (item: FileSystemItem) => {
		if (item.type === 'file') {
			let moduleId = item.id;
			if (moduleId.includes('/')) {
				moduleId = moduleId.split('/')[0];
			}

			setWindows(prev => {
				if (prev.find(w => w.id === moduleId)) {
					setActiveWindowId(moduleId);
					return prev;
				}
				setActiveWindowId(moduleId);
				return [
					...prev,
					{
						id: moduleId,
						title: moduleId.toUpperCase(),
						component: getModuleComponent(moduleId),
						isOpen: true,
						isMinimized: false,
					},
				];
			});
		}
	};

	return (
		<ErrorBoundary>
			<>
				<Toaster
					position="bottom-right"
					toastOptions={{
						style: {
							background: 'var(--popover)',
							color: 'var(--popover-foreground)',
							border: '1px solid var(--border)',
							backdropFilter: 'blur(10px)',
						},
					}}
				/>

				<div className="h-full w-full bg-background text-foreground font-mono overflow-hidden flex flex-col relative">
					<Background3D />

					{/* Background Gradients */}
					<div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
						<div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,var(--primary)_0%,transparent_60%)] opacity-[0.12] dark:opacity-[0.08]" />
						<div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_100%_100%,var(--accent-foreground)_0%,transparent_50%)] opacity-[0.06] dark:opacity-[0.08]" />
						<div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_60%_at_0%_50%,var(--primary)_0%,transparent_40%)] opacity-[0.05] dark:opacity-[0.04]" />
						<div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[linear-gradient(color-mix(in_oklch,var(--foreground)_12%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklch,var(--foreground)_12%,transparent)_1px,transparent_1px)] bg-size-[56px_56px]" />
					</div>

					{/* Top Layout Bar */}
					<TopBar
						isMobile={isMobile}
						sidebarCollapsed={sidebarCollapsed}
						terminalCollapsed={terminalCollapsed}
						onToggleSidebar={() => {
							const panel = sidebarRef.current;
							if (panel) {
								if (sidebarCollapsed) panel.expand();
								else panel.collapse();
							}
						}}
						onToggleTerminal={() => {
							const panel = terminalRef.current;
							if (panel) {
								if (terminalCollapsed) panel.expand();
								else panel.collapse();
							}
						}}
						onFileSelect={handleFileSelect}
					/>

					{/* Main Workbench Area */}
					<div className="flex-1 z-10 relative overflow-hidden flex resize-smooth perspective-[2000px]">
						{!isMobile && !isLayoutReady ? (
							/* Loading Skeleton */
							<div className="h-full w-full flex items-center justify-center text-muted-foreground animate-pulse">
								LOADING SYSTEM...
							</div>
						) : !isMobile && isLayoutReady ? (
							<ResizablePanelGroup
								direction="horizontal"
								className="h-full w-full transform-style-3d"
								onLayout={onHorizontalLayout}
							>
								{/* Sidebar (Left) */}
								<ResizablePanel
									ref={sidebarRef}
									defaultSize={horizontalSizes[0]}
									minSize={0}
									maxSize={30}
									collapsible
									collapsedSize={0}
									onCollapse={() => setSidebarCollapsed(true)}
									onExpand={() => setSidebarCollapsed(false)}
									className="flex flex-col border-r border-border/60 bg-linear-to-b from-background/70 via-background/80 to-background/70 backdrop-blur-xl shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.05)] transition-transform duration-500 ease-out origin-left hover:rotate-y-0 rotate-y-2 hover:translate-z-0 translate-z-[-10px]"
									style={{ transformStyle: 'preserve-3d' }}
								>
									<div className="flex flex-col h-full relative">
										{/* Profile Header */}
										<div className="relative group/sidebar-header">
											<SidebarProfile />
											<button
												onClick={() => {
													const panel = sidebarRef.current;
													if (panel) panel.collapse();
												}}
												className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground bg-black/20 hover:bg-black/40 rounded transition-colors opacity-0 group-hover/sidebar-header:opacity-100"
												title="Hide Sidebar"
											>
												<PanelLeftClose className="w-3.5 h-3.5" />
											</button>
										</div>

										{/* Explorer Panel */}
										<div className="flex-1 overflow-hidden flex flex-col">
											<div className="px-2 py-1.5 text-[11px] font-semibold border-b border-border/50 bg-linear-to-r from-muted/50 to-muted/30 uppercase tracking-[0.25em] text-muted-foreground backdrop-blur-sm flex justify-between items-center group">
												<span>Explorer</span>
												<button
													onClick={() =>
														window.dispatchEvent(
															new CustomEvent('collapse-all-folders'),
														)
													}
													className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"
													title="Collapse All Folders"
												>
													<PanelLeftClose className="w-3 h-3" />
												</button>
											</div>
											<div className="flex-1 overflow-hidden">
												<ScrollArea className="h-full">
													<div className="p-2">
														<FolderTree
															items={initialFileSystem}
															onSelect={handleFileSelect}
														/>
													</div>
												</ScrollArea>
											</div>
										</div>
									</div>
								</ResizablePanel>

								<ResizableHandle
									withHandle
									className="bg-border/60 hover:bg-border transition-colors"
								/>

								{/* Right Side (Editor + Terminal) */}
								<ResizablePanel
									defaultSize={horizontalSizes[1]}
									className="transform-style-3d"
								>
									<ResizablePanelGroup
										direction="vertical"
										className="h-full w-full"
										onLayout={onVerticalLayout}
									>
										{/* Editor Area */}
										<ResizablePanel
											defaultSize={verticalSizes[0]}
											minSize={30}
											className="relative overflow-hidden bg-linear-to-br from-background/85 via-background/95 to-background/85 transition-transform duration-500 ease-out origin-center hover:scale-[1.002] shadow-2xl"
										>
											<div className="relative z-10 h-full flex flex-col">
												<EditorArea />
											</div>
										</ResizablePanel>

										<ResizableHandle
											withHandle
											className="bg-border/60 hover:bg-border transition-colors"
										/>

										{/* Terminal */}
										<ResizablePanel
											ref={terminalRef}
											defaultSize={verticalSizes[1]}
											minSize={0}
											maxSize={80}
											collapsible
											collapsedSize={0}
											onCollapse={() => setTerminalCollapsed(true)}
											onExpand={() => setTerminalCollapsed(false)}
											className="border-t border-border/60 bg-linear-to-r from-background/90 via-background/95 to-background/90 backdrop-blur-2xl shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.3)] dark:shadow-[0_-4px_24px_-4px_rgba(0,0,0,0.6)] transition-transform duration-500 ease-out origin-bottom hover:rotate-x-0 rotate-x-2 hover:translate-z-0 translate-z-[-10px]"
											style={{ transformStyle: 'preserve-3d' }}
										>
											<div className="h-full flex flex-col">
												<div className="p-3 border-b border-border/50 bg-linear-to-r from-muted/40 to-muted/20 text-[11px] uppercase tracking-[0.4em] text-muted-foreground flex items-center justify-between backdrop-blur-sm group">
													<span className="flex items-center gap-2">
														Terminal{' '}
														<span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
													</span>
													<button
														onClick={() => {
															const panel = terminalRef.current;
															if (panel) panel.collapse();
														}}
														className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary p-1 rounded hover:bg-muted/40"
														title="Minimize Terminal"
													>
														<ChevronDown className="w-4 h-4" />
													</button>
												</div>
												<div className="flex-1 overflow-hidden">
													<CLI />
												</div>
											</div>
										</ResizablePanel>
									</ResizablePanelGroup>
								</ResizablePanel>
							</ResizablePanelGroup>
						) : (
							<div className="flex-1 flex flex-col bg-background w-full overflow-hidden relative">
								<EditorArea />
							</div>
						)}
					</div>
					<Taskbar />
				</div>

				<WelcomeDialog />
				<HelpButton />
			</>
		</ErrorBoundary>
	);
}
