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
	Cpu,
	Activity,
} from 'lucide-react';
import { useState, useRef, useCallback } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Taskbar } from '@/components/core/Taskbar';
import { motion, AnimatePresence } from 'framer-motion';
import type { ImperativePanelHandle } from 'react-resizable-panels';
import { ThemeToggle } from '@/components/ui/theme-toggle';

// Persistent size helper (simple localStorage)
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

	// Persistent layout (vertical: main/terminal), (horizontal: sidebar/editor)
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

	// Sidebar controls
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

	// Terminal controls
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
						background: '#111',
						color: '#ccc',
						fontSize: '12px',
						borderRadius: '0px',
						border: '1px solid #333',
						fontFamily: 'monospace',
					},
				}}
			/>
			<div className="h-full w-full bg-[#050505] text-[#ccc] font-mono overflow-hidden flex flex-col relative transition-colors duration-300">
				{/* Background layers - Pure CSS Grid */}
				<div className="absolute inset-0 z-0 pointer-events-none">
					<div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[1] bg-[length:100%_2px,3px_100%] opacity-10" />
					<div
						className="absolute inset-0 opacity-20"
						style={{
							backgroundImage: `
								linear-gradient(to right, #111 1px, transparent 1px),
								linear-gradient(to bottom, #111 1px, transparent 1px)
							`,
							backgroundSize: '40px 40px',
						}}
					/>
				</div>

				{/* Top bar */}
				<motion.div
					initial={{ y: -30, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.4, ease: 'easeOut' }}
					className="h-8 border-b border-[#333] flex items-center px-4 text-xs select-none bg-[#0a0a0a] z-20 relative justify-between"
				>
					<div className="flex items-center gap-4">
						{isMobile && (
							<Sheet open={isExplorerOpen} onOpenChange={setIsExplorerOpen}>
								<SheetTrigger asChild>
									<button
										className="p-1 hover:bg-[#111] hover:text-[#00ff41] transition-colors"
										aria-label="Toggle explorer"
									>
										<Menu className="w-4 h-4" />
									</button>
								</SheetTrigger>
								<SheetContent
									side="left"
									className="w-[250px] p-0 bg-[#0a0a0a] border-r border-[#333]"
								>
									<div className="p-2 text-xs font-bold border-b border-[#333] bg-[#111] uppercase tracking-[0.2em] text-[#00ff41]">
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
						<span className="font-bold tracking-[0.2em] text-sm flex items-center gap-2 text-[#00ff41]">
							ANURAGOS
							<span className="text-[10px] opacity-50">KERNEL v2.0</span>
						</span>
					</div>

					{!isMobile && (
						<div className="flex items-center gap-8 opacity-50 text-[10px] tracking-widest">
							<span className="flex items-center gap-1">
								<Cpu className="w-3 h-3" /> SYSTEM OPTIMAL
							</span>
							<span className="flex items-center gap-1">
								<Activity className="w-3 h-3" /> NETWORK SECURE
							</span>
						</div>
					)}

					<div className="flex items-center gap-3">
						{/* Sidebar controls */}
						<div className="flex items-center gap-1 pl-2 pr-1 border-l border-[#333]">
							{sidebarCollapsed ? (
								<button
									className="p-1 hover:bg-[#111] text-[#666] hover:text-[#00ff41] transition-colors"
									onClick={showSidebar}
								>
									<PanelLeftOpen className="w-3 h-3" />
								</button>
							) : (
								<>
									<button
										className="p-1 hover:bg-[#111] text-[#666] hover:text-[#00ff41] transition-colors"
										onClick={cutSidebar}
									>
										<PanelLeftClose className="w-3 h-3" />
									</button>
									<button
										className="p-1 hover:bg-[#111] text-[#666] hover:text-[#00ff41] transition-colors"
										onClick={hideSidebar}
									>
										<EyeOff className="w-3 h-3" />
									</button>
								</>
							)}
						</div>

						{/* Terminal controls */}
						<div className="flex items-center gap-1 pl-2 pr-1 border-l border-[#333]">
							{terminalCollapsed ? (
								<button
									className="p-1 hover:bg-[#111] text-[#666] hover:text-[#00ff41] transition-colors"
									onClick={showTerminal}
								>
									<TerminalIcon className="w-3 h-3" />
								</button>
							) : (
								<>
									<button
										className="p-1 hover:bg-[#111] text-[#666] hover:text-[#00ff41] transition-colors"
										onClick={cutTerminal}
									>
										<ChevronDown className="w-3 h-3" />
									</button>
									<button
										className="p-1 hover:bg-[#111] text-[#666] hover:text-[#00ff41] transition-colors"
										onClick={hideTerminal}
									>
										<Eye className="w-3 h-3 rotate-180" />
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
										className="flex flex-col border-r border-[#333] bg-[#0a0a0a] relative transition-colors duration-300"
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
												className="border-b border-[#333]"
											>
												<div className="h-full flex flex-col">
													<div className="p-2 text-[10px] font-bold border-b border-[#333] bg-[#111] uppercase tracking-[0.2em] text-[#666]">
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
																			x: -18,
																		}}
																		animate={{
																			opacity: 1,
																			x: 0,
																		}}
																		exit={{
																			opacity: 0,
																			x: -18,
																		}}
																		transition={{
																			duration: 0.18,
																		}}
																		key={win.id}
																		className={cn(
																			'flex items-center justify-between px-3 py-1.5 text-xs cursor-pointer group/item relative transition-colors border-l-2 border-transparent',
																			'hover:bg-[#111]',
																			activeWindowId ===
																				win.id &&
																				'bg-[#111] text-[#00ff41] border-[#00ff41]',
																		)}
																		onClick={() =>
																			setActiveWindowId(
																				win.id,
																			)
																		}
																	>
																		<div className="flex items-center gap-2 overflow-hidden">
																			<span className="truncate group-hover/item:text-[#ccc] transition-colors">
																				{win.title}
																			</span>
																		</div>
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
																				if (
																					activeWindowId ===
																					win.id
																				) {
																					setActiveWindowId(
																						newWindows.length
																							? newWindows[
																									newWindows.length -
																										1
																							  ].id
																							: null,
																					);
																				}
																			}}
																			className="opacity-0 group-hover/item:opacity-100 p-0.5 hover:bg-[#222] hover:text-red-500 transition-all"
																			aria-label={`Close ${win.title}`}
																		>
																			<X className="w-3 h-3" />
																		</button>
																	</motion.div>
																))}
															</AnimatePresence>
															{windows.length === 0 && (
																<div className="p-4 text-xs text-[#444] text-center italic">
																	[NO ACTIVE PROCESSES]
																</div>
															)}
														</motion.div>
													</ScrollArea>
												</div>
											</ResizablePanel>

											<ResizableHandle className="bg-[#333] hover:bg-[#00ff41] transition-colors w-[1px]" />

											<ResizablePanel defaultSize={62} minSize={26}>
												<div className="h-full flex flex-col">
													<div className="p-2 text-[10px] font-bold border-b border-[#333] bg-[#111] uppercase tracking-[0.2em] text-[#666]">
														File System
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
										className="bg-[#333] hover:bg-[#00ff41] transition-colors w-[1px]"
									/>

									<ResizablePanel
										defaultSize={horizontalSizes[1]}
										minSize={35}
										className="relative overflow-hidden bg-[#050505]"
									>
										<div className="relative z-10 h-full flex flex-col">
											<EditorArea />
										</div>
									</ResizablePanel>
								</ResizablePanelGroup>
							</ResizablePanel>

							<ResizableHandle
								withHandle
								className="bg-[#333] hover:bg-[#00ff41] transition-colors h-[1px]"
							/>

							{/* Bottom terminal */}
							<ResizablePanel
								ref={terminalRef}
								defaultSize={verticalSizes[1]}
								minSize={0}
								maxSize={45}
								collapsible
								collapsedSize={4}
								className="border-t border-[#333] bg-[#0a0a0a] relative"
							>
								<div className="h-full flex flex-col">
									<div className="p-2 border-b border-[#333] text-[10px] uppercase tracking-[0.2em] text-[#666] flex items-center justify-between bg-[#111]">
										<span className="flex items-center gap-2">
											TERMINAL
											<span className="w-1.5 h-1.5 bg-[#00ff41] animate-pulse" />
										</span>
										<span className="text-[9px] text-[#00ff41] opacity-70">
											BASH
										</span>
									</div>
									<div className="flex-1 overflow-hidden">
										<CLI />
									</div>
								</div>
							</ResizablePanel>
						</ResizablePanelGroup>
					) : (
						<div className="flex-1 flex flex-col bg-[#050505] w-full">
							<CLI />
						</div>
					)}
				</div>
				<Taskbar />
			</div>
		</>
	);
}
