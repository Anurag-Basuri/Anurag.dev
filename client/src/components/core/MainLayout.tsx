'use client';

import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderTree } from '@/components/core/FolderTree';
import { CLI } from '@/components/core/CLI';
import { initialFileSystem, FileSystemItem } from '@/lib/data';
import { useAtom } from 'jotai';
import { windowsAtom, activeWindowIdAtom } from '@/store/atoms';
import { getModuleComponent } from '@/lib/moduleRegistry';
import { EditorArea } from '@/components/core/EditorArea';
import { Toaster } from 'react-hot-toast';
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
	Sparkles,
} from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Taskbar } from '@/components/core/Taskbar';
import { motion, AnimatePresence } from 'framer-motion';
import type { ImperativePanelHandle } from 'react-resizable-panels';

// Persistent size helper (no change to API)
function usePersistentSizes(key: string, initial: number[]) {
	const [sizes, setSizes] = useState<number[]>(() => {
		try {
			const raw = localStorage.getItem(key);
			if (raw) {
				const parsed = JSON.parse(raw);
				if (Array.isArray(parsed) && parsed.every(n => typeof n === 'number')) {
					return parsed;
				}
			}
		} catch {}
		return initial;
	});

	const onLayout = useCallback(
		(next: number[]) => {
			setSizes(next);
			try {
				localStorage.setItem(key, JSON.stringify(next));
			} catch {}
		},
		[key],
	);

	return { sizes, onLayout };
}

export function MainLayout() {
	const [windows, setWindows] = useAtom(windowsAtom);
	const [activeWindowId, setActiveWindowId] = useAtom(activeWindowIdAtom);
	const isMobile = useMediaQuery('(max-width: 768px)');
	const [isExplorerOpen, setIsExplorerOpen] = useState(false);

	const sidebarRef = useRef<ImperativePanelHandle>(null);
	const terminalRef = useRef<ImperativePanelHandle>(null);

	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [terminalCollapsed, setTerminalCollapsed] = useState(false);

	const { sizes: verticalSizes, onLayout: onVerticalLayout } = usePersistentSizes(
		'layout:v',
		[75, 25],
	);
	const { sizes: horizontalSizes, onLayout: onHorizontalLayout } = usePersistentSizes(
		'layout:h',
		[20, 80],
	);

	const handleFileSelect = (item: FileSystemItem) => {
		if (item.type === 'file') {
			const moduleId = item.id;
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
						title: item.name.toUpperCase(),
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

	return (
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
				{/* Background polish, respects themes */}
				<div className="absolute inset-0 z-0 pointer-events-none">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_color-mix(in_oklch,var(--ring)_18%,transparent),transparent_55%)] opacity-25" />
					<div className="absolute inset-0 opacity-15 bg-[linear-gradient(color-mix(in_oklch,var(--foreground)_10%,transparent)_1px,transparent_1px),linear-gradient(90deg,color-mix(in_oklch,var(--foreground)_10%,transparent)_1px,transparent_1px)] bg-[size:46px_46px]" />
				</div>

				{/* Top bar */}
				<motion.div
					initial={{ y: -28, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.35, ease: 'easeOut' }}
					className="h-10 border-b flex items-center px-4 text-xs select-none bg-background/70 backdrop-blur-md z-20 relative border-border justify-between shadow-[0_5px_22px_-4px_rgba(0,0,0,0.45)]"
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
									<ScrollArea className="h-full">
										<div className="p-2">
											<FolderTree
												items={initialFileSystem}
												onSelect={handleFileSelect}
											/>
										</div>
									</ScrollArea>
								</SheetContent>
							</Sheet>
						)}
						<span className="font-bold tracking-[0.35em] text-sm flex items-center gap-2">
							ANURAGOS
							<Sparkles className="w-3.5 h-3.5 text-primary/80" />
						</span>
					</div>

					{!isMobile && (
						<span className="flex-1 text-center text-muted-foreground tracking-[0.35em]">
							SYSTEM READY
						</span>
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

						{/* Sidebar controls */}
						<div className="flex items-center gap-1 pl-2 pr-1 rounded bg-muted/40 border border-border backdrop-blur-sm">
							{sidebarCollapsed ? (
								<button
									className="p-1 hover:bg-muted/60 rounded"
									title="Show sidebar"
									aria-label="Show sidebar"
									onClick={showSidebar}
								>
									<PanelLeftOpen className="w-4 h-4" />
								</button>
							) : (
								<>
									<button
										className="p-1 hover:bg-muted/60 rounded"
										title="Cut sidebar"
										aria-label="Cut sidebar"
										onClick={cutSidebar}
									>
										<PanelLeftClose className="w-4 h-4" />
									</button>
									<button
										className="p-1 hover:bg-muted/60 rounded"
										title="Hide sidebar"
										aria-label="Hide sidebar"
										onClick={hideSidebar}
									>
										<EyeOff className="w-4 h-4" />
									</button>
								</>
							)}
						</div>

						{/* Terminal controls */}
						<div className="flex items-center gap-1 pl-2 pr-1 rounded bg-muted/40 border border-border backdrop-blur-sm">
							{terminalCollapsed ? (
								<button
									className="p-1 hover:bg-muted/60 rounded"
									title="Show terminal"
									aria-label="Show terminal"
									onClick={showTerminal}
								>
									<TerminalIcon className="w-4 h-4" />
								</button>
							) : (
								<>
									<button
										className="p-1 hover:bg-muted/60 rounded"
										title="Cut terminal"
										aria-label="Cut terminal"
										onClick={cutTerminal}
									>
										<ChevronDown className="w-4 h-4" />
									</button>
									<button
										className="p-1 hover:bg-muted/60 rounded"
										title="Hide terminal"
										aria-label="Hide terminal"
										onClick={hideTerminal}
									>
										<Eye className="w-4 h-4 rotate-180" />
									</button>
								</>
							)}
						</div>
					</div>
				</motion.div>

				{/* Main area */}
				<div className="flex-1 z-10 relative overflow-hidden flex resize-smooth">
					{!isMobile ? (
						<ResizablePanelGroup
							direction="vertical"
							className="h-full w-full"
							onLayout={onVerticalLayout}
							id="layout-vertical"
						>
							<ResizablePanel defaultSize={verticalSizes[0]} minSize={40}>
								<ResizablePanelGroup
									direction="horizontal"
									className="h-full"
									onLayout={onHorizontalLayout}
									id="layout-horizontal"
								>
									<ResizablePanel
										ref={sidebarRef}
										defaultSize={horizontalSizes[0]}
										minSize={0}
										maxSize={30}
										collapsible
										collapsedSize={3}
										className="flex flex-col border-r border-border bg-background/60 backdrop-blur-md"
									>
										<ResizablePanelGroup
											direction="vertical"
											className="h-full"
										>
											<ResizablePanel
												defaultSize={38}
												minSize={12}
												collapsible
												collapsedSize={8}
												className="border-b border-border"
											>
												<div className="h-full flex flex-col">
													<div className="p-2 text-[11px] font-semibold border-b border-border bg-muted/40 uppercase tracking-[0.25em] text-muted-foreground">
														Open Editors
													</div>
													<ScrollArea className="flex-1">
														<motion.div
															layout
															className="flex flex-col"
														>
															<AnimatePresence>
																{windows.map(win => (
																	<motion.div
																		layout
																		initial={{
																			opacity: 0,
																			x: -16,
																		}}
																		animate={{
																			opacity: 1,
																			x: 0,
																		}}
																		exit={{
																			opacity: 0,
																			x: -16,
																		}}
																		transition={{
																			duration: 0.16,
																		}}
																		key={win.id}
																		className={cn(
																			'flex items-center justify-between px-3 py-1.5 text-sm rounded-sm cursor-pointer group/item',
																			'hover:bg-muted/40',
																			activeWindowId ===
																				win.id &&
																				'bg-primary/15 text-primary shadow-[inset_0_0_0_1px_var(--border)]',
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
																<div className="p-4 text-xs text-muted-foreground text-center italic">
																	No open editors
																</div>
															)}
														</motion.div>
													</ScrollArea>
												</div>
											</ResizablePanel>

											<ResizableHandle className="bg-border/60 hover:bg-border transition-colors" />

											<ResizablePanel defaultSize={62} minSize={26}>
												<div className="h-full flex flex-col">
													<div className="p-2 text-[11px] font-semibold border-b border-border bg-muted/40 uppercase tracking-[0.25em] text-muted-foreground">
														Explorer
													</div>
													<ScrollArea className="flex-1">
														<div className="p-2">
															<FolderTree
																items={initialFileSystem}
																onSelect={handleFileSelect}
															/>
														</div>
													</ScrollArea>
												</div>
											</ResizablePanel>
										</ResizablePanelGroup>
									</ResizablePanel>

									<ResizableHandle
										withHandle
										className="bg-border/60 hover:bg-border transition-colors"
									/>

									<ResizablePanel
										defaultSize={horizontalSizes[1]}
										minSize={35}
										className="relative overflow-hidden bg-gradient-to-br from-background/70 via-background/80 to-background/70"
									>
										<div className="relative z-10 h-full flex flex-col">
											<EditorArea />
										</div>
									</ResizablePanel>
								</ResizablePanelGroup>
							</ResizablePanel>

							<ResizableHandle
								withHandle
								className="bg-border/60 hover:bg-border transition-colors"
							/>

							{/* Bottom terminal */}
							<ResizablePanel
								ref={terminalRef}
								defaultSize={verticalSizes[1]}
								minSize={0}
								maxSize={45}
								collapsible
								collapsedSize={4}
								className="border-t border-border bg-background/85 backdrop-blur-xl"
							>
								<div className="h-full flex flex-col">
									<div className="p-3 border-b border-border text-[11px] uppercase tracking-[0.4em] text-muted-foreground flex items-center justify-between">
										<span className="flex items-center gap-2">
											Terminal{' '}
											<span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
										</span>
									</div>
									<div className="flex-1 overflow-hidden">
										<CLI />
									</div>
								</div>
							</ResizablePanel>
						</ResizablePanelGroup>
					) : (
						<div className="flex-1 flex flex-col bg-muted/40 backdrop-blur-sm w-full">
							<CLI />
						</div>
					)}
				</div>
				<Taskbar />
			</div>
		</>
	);
}
