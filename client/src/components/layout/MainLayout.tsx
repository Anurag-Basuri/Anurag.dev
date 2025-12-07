'use client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderTree } from '@/components/features/file-system/FolderTree';
import { SidebarProfile } from '@/components/layout/SidebarProfile';
import ConnectivityBanner from '@/components/shared/ConnectivityBanner';
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
import {
	Menu,
	X,
	PanelLeftOpen,
	PanelLeftClose,
	Terminal as TerminalIcon,
	EyeOff,
	Eye,
	ChevronDown,
} from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import type { ImperativePanelHandle } from 'react-resizable-panels';
import Background3D from '@/components/layout/Background3D';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { WelcomeDialog } from '@/components/shared/WelcomeDialog';
import { HelpButton } from '@/components/shared/HelpButton';

// Persistent size helper - defers localStorage read to avoid SSR hydration mismatch
function usePersistentSizes(key: string, initial: number[]) {
	// Always start with initial values for SSR consistency
	const [sizes, setSizes] = useState<number[]>(initial);
	const [isHydrated, setIsHydrated] = useState(false);

	// Read from localStorage only after hydration
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
	const [isExplorerOpen, setIsExplorerOpen] = useState(false);

	// Track client-side mount to prevent hydration mismatch
	const [isMounted, setIsMounted] = useState(false);
	useEffect(() => {
		setIsMounted(true);
	}, []);

	const sidebarRef = useRef<ImperativePanelHandle>(null);
	const terminalRef = useRef<ImperativePanelHandle>(null);
	const editorsRef = useRef<ImperativePanelHandle>(null);

	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [terminalCollapsed, setTerminalCollapsed] = useState(false);
	const [isEditorsCollapsed, setIsEditorsCollapsed] = useState(false);

	const {
		sizes: verticalSizes,
		onLayout: onVerticalLayout,
		isHydrated: vHydrated,
	} = usePersistentSizes('layout:v', [60, 40]);
	const {
		sizes: horizontalSizes,
		onLayout: onHorizontalLayout,
		isHydrated: hHydrated,
	} = usePersistentSizes('layout:h', [20, 80]);

	// Only render panels after client-side hydration is complete
	const isLayoutReady = isMounted && vHydrated && hHydrated;

	const handleFileSelect = (item: FileSystemItem) => {
		if (item.type === 'file') {
			// Extract root module ID from file path (e.g., "about/whoami.md" -> "about")
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
			if (isMobile) setIsExplorerOpen(false);
		}
	};

	// Controls (unchanged behavior)
	const cutSidebar = () => {
		sidebarRef.current?.collapse();
		setSidebarCollapsed(true);
	};
	const hideSidebar = () => {
		sidebarRef.current?.resize(0);
		setSidebarCollapsed(true);
	};
	const showSidebar = () => {
		sidebarRef.current?.expand();
		setSidebarCollapsed(false);
	};
	const cutTerminal = () => {
		terminalRef.current?.collapse();
		setTerminalCollapsed(true);
	};
	const hideTerminal = () => {
		terminalRef.current?.resize(0);
		setTerminalCollapsed(true);
	};
	const showTerminal = () => {
		terminalRef.current?.expand();
		setTerminalCollapsed(false);
	};

	// ... existing imports

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
				<ConnectivityBanner />
				<div className="h-full w-full bg-background text-foreground font-mono overflow-hidden flex flex-col relative">
					{/* 3D Background Layer */}
					<Background3D />

					{/* Enhanced Background with Premium Layered Gradients */}
					<div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
						{/* Primary radial gradient - top center */}
						<div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_-10%,var(--primary)_0%,transparent_60%)] opacity-[0.12] dark:opacity-[0.08]" />
						{/* Secondary gradient - bottom right corner */}
						<div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_100%_100%,var(--accent-foreground)_0%,transparent_50%)] opacity-[0.06] dark:opacity-[0.08]" />
						{/* Tertiary gradient - left side accent */}
						<div className="absolute inset-0 bg-[radial-gradient(ellipse_30%_60%_at_0%_50%,var(--primary)_0%,transparent_40%)] opacity-[0.05] dark:opacity-[0.04]" />
						{/* Subtle grid pattern - more refined */}
						<div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-[linear-gradient(color-mix(in_oklch,var(--foreground)_12%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklch,var(--foreground)_12%,transparent)_1px,transparent_1px)] bg-size-[56px_56px]" />
						{/* Noise texture overlay for depth */}
						<div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIzMDAiIGZpbHRlcj0idXJsKCNhKSIgb3BhY2l0eT0iMSIvPjwvc3ZnPg==')]" />
					</div>

					{/* Premium Top Bar with Enhanced Glassmorphism */}
					<motion.div
						initial={{ y: -28, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
						className="h-11 border-b flex items-center px-4 text-xs select-none backdrop-blur-2xl z-20 relative justify-between bg-linear-to-r from-card/80 via-card/90 to-card/80 border-border/50 shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08),inset_0_-1px_0_0_rgba(255,255,255,0.05)] dark:shadow-[0_4px_24px_-4px_rgba(0,0,0,0.4),inset_0_-1px_0_0_rgba(255,255,255,0.03)]"
					>
						<div className="flex items-center gap-3">
							{isMobile && (
								<Sheet open={isExplorerOpen} onOpenChange={setIsExplorerOpen}>
									<SheetTrigger asChild>
										<button
											className="p-1.5 hover:bg-muted/40 rounded transition-colors"
											aria-label="Toggle explorer"
										>
											<Menu className="w-4 h-4" />
										</button>
									</SheetTrigger>
									<SheetContent
										side="left"
										className="w-[260px] p-0 bg-background/95 backdrop-blur-md border-r border-border"
									>
										<div className="p-2 text-xs font-semibold border-b border-border bg-muted/40 uppercase tracking-[0.28em] text-muted-foreground">
											Explorer
										</div>
										<div className="flex-1 overflow-hidden">
											<ScrollArea className="h-[calc(100vh-12rem)]">
												<div className="p-2">
													<FolderTree
														items={initialFileSystem}
														onSelect={handleFileSelect}
													/>
												</div>
											</ScrollArea>
										</div>
									</SheetContent>
								</Sheet>
							)}
							<span className="font-bold tracking-[0.35em] text-sm flex items-center gap-2">
								ANURAGOS
							</span>
						</div>

						{!isMobile && (
							<div className="flex-1 flex justify-center items-center gap-6">
								<span className="text-muted-foreground tracking-[0.35em]">
									SYSTEM READY
								</span>
								<button
									onClick={() => {
										const contactItem = {
											id: 'contact',
											name: 'contact',
											type: 'file',
										} as FileSystemItem;
										handleFileSelect(contactItem);
									}}
									className="text-muted-foreground hover:text-primary transition-colors tracking-[0.2em] hover:tracking-[0.25em] duration-300 text-[10px] uppercase border border-transparent hover:border-primary/20 px-2 py-0.5 rounded-sm"
								>
									Contact
								</button>
							</div>
						)}

						<div className="flex items-center gap-2">
							{/* Status */}
							<div className="flex gap-2 items-center pr-2 border-r border-border">
								<span
									aria-hidden
									className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_2px_rgba(34,197,94,0.5)]"
								/>
								<span className="text-[10px] text-muted-foreground uppercase tracking-[0.4em]">
									ONLINE
								</span>
							</div>

							{/* Theme Toggle */}
							<div className={cn('pr-2', !isMobile && 'border-r border-border')}>
								<ThemeToggle />
							</div>

							{/* Desktop Layout Controls */}
							{!isMobile && (
								<>
									{/* Sidebar controls */}
									<div className="flex items-center gap-1 pl-2 pr-1 rounded bg-muted/40 border border-border backdrop-blur-sm">
										<button
											className={cn(
												'p-1 hover:bg-muted/60 rounded transition-all duration-200',
												sidebarCollapsed && 'text-muted-foreground',
											)}
											title={
												sidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'
											}
											aria-label={
												sidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'
											}
											onClick={() => {
												const panel = sidebarRef.current;
												if (panel) {
													if (sidebarCollapsed) panel.expand();
													else panel.collapse();
												}
											}}
										>
											{sidebarCollapsed ? (
												<PanelLeftOpen className="w-4 h-4" />
											) : (
												<PanelLeftClose className="w-4 h-4" />
											)}
										</button>
									</div>

									{/* Terminal controls */}
									<div className="flex items-center gap-1 pl-2 pr-1 rounded bg-muted/40 border border-border backdrop-blur-sm">
										<button
											className={cn(
												'p-1 hover:bg-muted/60 rounded transition-all duration-200',
												terminalCollapsed && 'text-muted-foreground',
											)}
											title={
												terminalCollapsed
													? 'Show Terminal'
													: 'Hide Terminal'
											}
											aria-label={
												terminalCollapsed
													? 'Show Terminal'
													: 'Hide Terminal'
											}
											onClick={() => {
												const panel = terminalRef.current;
												if (panel) {
													if (terminalCollapsed) panel.expand();
													else panel.collapse();
												}
											}}
										>
											{terminalCollapsed ? (
												<TerminalIcon className="w-4 h-4" />
											) : (
												<ChevronDown className="w-4 h-4" />
											)}
										</button>
									</div>
								</>
							)}
						</div>
					</motion.div>

					{/* Main area with 3D Perspective */}
					<div className="flex-1 z-10 relative overflow-hidden flex resize-smooth perspective-[2000px]">
						{!isMobile && !isLayoutReady ? (
							/* Premium loading skeleton during SSR/hydration */
							<div className="h-full w-full flex">
								{/* Sidebar skeleton */}
								<div className="w-[20%] min-w-[200px] bg-linear-to-b from-muted/25 via-muted/15 to-muted/20 border-r border-border/30 flex flex-col">
									<div className="p-4 border-b border-border/25">
										<div className="flex items-center gap-3">
											<div className="w-10 h-10 rounded-full bg-muted/40 animate-pulse" />
											<div className="flex-1 space-y-2">
												<div className="h-3 w-24 bg-muted/40 rounded animate-pulse" />
												<div className="h-2 w-16 bg-muted/30 rounded animate-pulse" />
											</div>
										</div>
									</div>
									<div className="flex-1 p-3 space-y-2">
										{[...Array(5)].map((_, i) => (
											<div
												key={i}
												className="h-6 bg-muted/20 rounded animate-pulse"
												style={{
													width: `${[60, 75, 90, 65, 80][i] || 70}%`,
													animationDelay: `${i * 100}ms`,
												}}
											/>
										))}
									</div>
								</div>
								{/* Content skeleton */}
								<div className="flex-1 flex flex-col">
									<div className="flex-1 bg-linear-to-br from-muted/10 via-muted/5 to-muted/15 flex items-center justify-center">
										<div className="w-12 h-12 rounded-lg bg-muted/30 animate-pulse" />
									</div>
									<div className="h-[25%] bg-linear-to-t from-muted/25 to-muted/15 border-t border-border/25 p-4">
										<div className="space-y-2">
											<div className="h-3 w-32 bg-muted/30 rounded animate-pulse" />
											<div className="h-4 w-full bg-muted/20 rounded animate-pulse" />
										</div>
									</div>
								</div>
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
										{/* Sidebar Profile with Close Button */}
										<div className="relative group/sidebar-header">
											<SidebarProfile />
											<button
												onClick={() => {
													const panel = sidebarRef.current;
													if (panel) panel.collapse();
												}}
												className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground bg-black/20 hover:bg-black/40 rounded transition-colors opacity-0 group-hover/sidebar-header:opacity-100"
												title="Hide Sidebar"
												aria-label="Hide Sidebar"
											>
												<PanelLeftClose className="w-3.5 h-3.5" />
											</button>
										</div>

										{/* Persistent Open Editors Header */}
										<div
											className="px-2 py-1.5 text-[11px] font-semibold border-b border-border/50 bg-linear-to-r from-muted/50 to-muted/30 uppercase tracking-[0.25em] text-muted-foreground backdrop-blur-sm flex justify-between items-center group cursor-pointer hover:bg-muted/40 transition-colors"
											onClick={() => {
												const panel = editorsRef.current;
												if (panel) {
													if (isEditorsCollapsed) panel.expand();
													else panel.collapse();
												}
											}}
										>
											<span>Open Editors</span>
											<button
												className="text-muted-foreground hover:text-primary transition-colors"
												title={isEditorsCollapsed ? 'Expand' : 'Collapse'}
											>
												<ChevronDown
													className={cn(
														'w-3 h-3 transition-transform duration-200',
														isEditorsCollapsed && 'rotate-180',
													)}
												/>
											</button>
										</div>

										{/* Resizable Group for Open Editors List vs Explorer */}
										<ResizablePanelGroup
											direction="vertical"
											className="flex-1"
										>
											{/* Open Editors List (Collapsible) */}
											<ResizablePanel
												ref={editorsRef}
												defaultSize={30}
												minSize={0}
												collapsible
												collapsedSize={0}
												onCollapse={() => setIsEditorsCollapsed(true)}
												onExpand={() => setIsEditorsCollapsed(false)}
												className={cn(
													'transition-all duration-300 ease-in-out',
													isEditorsCollapsed
														? 'border-b-0'
														: 'border-b border-border/60',
												)}
											>
												<div className="h-full overflow-hidden">
													<ScrollArea className="h-full">
														<div className="flex flex-col">
															<AnimatePresence>
																{windows.map(win => (
																	<motion.div
																		layout
																		initial={{
																			opacity: 0,
																			x: -10,
																		}}
																		animate={{
																			opacity: 1,
																			x: 0,
																		}}
																		exit={{
																			opacity: 0,
																			x: -10,
																		}}
																		transition={{
																			duration: 0.15,
																		}}
																		key={win.id}
																		className={cn(
																			'flex items-center justify-between px-3 py-1.5 text-sm rounded-sm cursor-pointer group/item',
																			'hover:bg-muted/40',
																			activeWindowId ===
																				win.id &&
																				'bg-primary/10 text-primary shadow-[inset_0_0_0_1px_var(--border)]',
																		)}
																		onClick={() =>
																			setActiveWindowId(
																				win.id,
																			)
																		}
																	>
																		<span className="truncate text-muted-foreground group-hover/item:text-foreground transition-colors text-[12px]">
																			{win.title}
																		</span>
																		<button
																			onClick={e => {
																				e.stopPropagation();
																				const newWindows =
																					windows.filter(
																						w =>
																							w.id !==
																							win.id,
																					);
																				setWindows(
																					newWindows,
																				);
																				setActiveWindowId(
																					newWindows.length
																						? newWindows[
																								newWindows.length -
																									1
																						  ].id
																						: null,
																				);
																			}}
																			className="opacity-0 group-hover/item:opacity-100 p-0.5 hover:bg-muted/60 rounded transition-opacity"
																			aria-label={`Close ${win.title}`}
																		>
																			<X className="w-3 h-3 text-muted-foreground hover:text-foreground" />
																		</button>
																	</motion.div>
																))}
															</AnimatePresence>
															{windows.length === 0 && (
																<div className="p-4 text-xs text-muted-foreground/50 text-center italic">
																	No open editors
																</div>
															)}
														</div>
													</ScrollArea>
												</div>
											</ResizablePanel>

											<ResizableHandle className="bg-border/40 hover:bg-primary/50 transition-colors h-px" />

											{/* Explorer Panel */}
											<ResizablePanel defaultSize={70} minSize={20}>
												<div className="h-full flex flex-col">
													<div className="px-2 py-1.5 text-[11px] font-semibold border-b border-border/50 bg-linear-to-r from-muted/50 to-muted/30 uppercase tracking-[0.25em] text-muted-foreground backdrop-blur-sm flex justify-between items-center group">
														<span>Explorer</span>
														<button
															onClick={() => {
																window.dispatchEvent(
																	new CustomEvent(
																		'collapse-all-folders',
																	),
																);
															}}
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
											</ResizablePanel>
										</ResizablePanelGroup>
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
				</div>

				{/* Welcome Dialog for first-time visitors */}
				<WelcomeDialog />

				{/* Floating Help Button */}
				<HelpButton />
			</>
		</ErrorBoundary>
	);
}
