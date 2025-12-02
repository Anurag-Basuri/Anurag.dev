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
} from 'lucide-react';
import { useState, useRef } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Taskbar } from '@/components/core/Taskbar';
import { motion, AnimatePresence } from 'framer-motion';
import type { ImperativePanelHandle } from 'react-resizable-panels';

export function MainLayout() {
	const [windows, setWindows] = useAtom(windowsAtom);
	const [activeWindowId, setActiveWindowId] = useAtom(activeWindowIdAtom);
	const isMobile = useMediaQuery('(max-width: 768px)');
	const [isExplorerOpen, setIsExplorerOpen] = useState(false);

	// New: refs to control panels programmatically
	const sidebarRef = useRef<ImperativePanelHandle>(null);
	const terminalRef = useRef<ImperativePanelHandle>(null);

	// Track our own collapsed/hide toggles (kept simple)
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [terminalCollapsed, setTerminalCollapsed] = useState(false);

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
			if (isMobile) {
				setIsExplorerOpen(false);
			}
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
						background: '#333',
						color: '#fff',
						fontSize: '12px',
						borderRadius: '4px',
						border: '1px solid rgba(255,255,255,0.1)',
					},
				}}
			/>
			<div className="h-full w-full bg-background text-foreground font-mono overflow-hidden flex flex-col relative">
				<div
					className="absolute inset-0 z-0 bg-cover bg-center opacity-25 pointer-events-none"
					style={{
						backgroundImage:
							'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")',
					}}
				/>
				<div className="absolute inset-0 z-0 pointer-events-none">
					<div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_55%)]" />
					<div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:40px_40px]" />
				</div>

				<motion.div
					initial={{ y: -40, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.5, ease: 'easeOut' }}
					className="h-10 border-b flex items-center px-4 text-xs select-none bg-background/75 backdrop-blur-md z-20 relative border-white/10 justify-between shadow-[0_5px_30px_rgba(0,0,0,0.4)]"
				>
					<div className="flex items-center gap-3">
						{isMobile && (
							<Sheet open={isExplorerOpen} onOpenChange={setIsExplorerOpen}>
								<SheetTrigger asChild>
									<button className="p-1.5 hover:bg-white/10 rounded">
										<Menu className="w-4 h-4" />
									</button>
								</SheetTrigger>
								<SheetContent
									side="left"
									className="w-[250px] p-0 bg-background/95 backdrop-blur-md border-r border-white/10"
								>
									<div className="p-2 text-xs font-bold border-b border-white/10 bg-white/5 uppercase tracking-[0.3em] text-muted-foreground">
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
						<span className="font-bold tracking-[0.4em] text-sm">ANURAGOS</span>
					</div>

					{!isMobile && (
						<span className="flex-1 text-center text-muted-foreground tracking-[0.3em]">
							SYSTEM READY
						</span>
					)}

					<div className="flex items-center gap-2">
						{/* Status */}
						<div className="flex gap-2 items-center pr-2 border-r border-white/10">
							<div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
							<span className="text-[10px] text-muted-foreground uppercase tracking-[0.4em]">
								ONLINE
							</span>
						</div>

						{/* Sidebar controls */}
						<div className="flex items-center gap-1 pl-2 pr-1 rounded bg-white/5 border border-white/10">
							{sidebarCollapsed ? (
								<button
									className="p-1 hover:bg-white/10 rounded"
									title="Show sidebar"
									aria-label="Show sidebar"
									onClick={showSidebar}
								>
									<PanelLeftOpen className="w-4 h-4" />
								</button>
							) : (
								<>
									<button
										className="p-1 hover:bg-white/10 rounded"
										title="Cut sidebar"
										aria-label="Cut sidebar"
										onClick={cutSidebar}
									>
										<PanelLeftClose className="w-4 h-4" />
									</button>
									<button
										className="p-1 hover:bg-white/10 rounded"
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
						<div className="flex items-center gap-1 pl-2 pr-1 rounded bg-white/5 border border-white/10">
							{terminalCollapsed ? (
								<button
									className="p-1 hover:bg-white/10 rounded"
									title="Show terminal"
									aria-label="Show terminal"
									onClick={showTerminal}
								>
									<TerminalIcon className="w-4 h-4" />
								</button>
							) : (
								<>
									<button
										className="p-1 hover:bg-white/10 rounded"
										title="Cut terminal"
										aria-label="Cut terminal"
										onClick={cutTerminal}
									>
										<ChevronDown className="w-4 h-4" />
									</button>
									<button
										className="p-1 hover:bg-white/10 rounded"
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

				<div className="flex-1 z-10 relative overflow-hidden flex resize-smooth">
					{!isMobile ? (
						// Reworked: vertical group so Terminal sits at the bottom
						<ResizablePanelGroup direction="vertical" className="h-full w-full">
							{/* Top section: sidebar + editor */}
							<ResizablePanel defaultSize={75} minSize={40}>
								<ResizablePanelGroup direction="horizontal" className="h-full">
									<ResizablePanel
										ref={sidebarRef}
										defaultSize={20}
										minSize={0}
										maxSize={28}
										collapsible
										collapsedSize={3}
										className="flex flex-col border-r border-white/10 bg-background/60 backdrop-blur-md"
									>
										<ResizablePanelGroup
											direction="vertical"
											className="h-full"
										>
											<ResizablePanel
												defaultSize={35}
												minSize={12}
												collapsible
												collapsedSize={8}
												className="border-b border-white/10"
											>
												<div className="h-full flex flex-col">
													<div className="p-2 text-[11px] font-semibold border-b border-white/10 bg-white/5 uppercase tracking-[0.25em] text-muted-foreground">
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
																			x: -20,
																		}}
																		animate={{
																			opacity: 1,
																			x: 0,
																		}}
																		exit={{
																			opacity: 0,
																			x: -20,
																		}}
																		transition={{
																			duration: 0.2,
																		}}
																		key={win.id}
																		className={cn(
																			'flex items-center justify-between px-3 py-1.5 text-sm hover:bg-white/5 cursor-pointer group/item',
																			activeWindowId ===
																				win.id &&
																				'bg-blue-500/20 text-blue-300 shadow-[inset_0_0_0_1px_rgba(96,165,250,0.4)]',
																		)}
																		onClick={() =>
																			setActiveWindowId(
																				win.id,
																			)
																		}
																	>
																		<div className="flex items-center gap-2 overflow-hidden">
																			<span className="truncate text-muted-foreground group-hover/item:text-foreground transition-colors">
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
																					if (
																						newWindows.length >
																						0
																					) {
																						setActiveWindowId(
																							newWindows[
																								newWindows.length -
																									1
																							].id,
																						);
																					} else {
																						setActiveWindowId(
																							null,
																						);
																					}
																				}
																			}}
																			className="opacity-0 group-hover/item:opacity-100 p-0.5 hover:bg-white/10 rounded transition-opacity"
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

											<ResizableHandle className="bg-white/10" />

											<ResizablePanel defaultSize={65} minSize={25}>
												<div className="h-full flex flex-col">
													<div className="p-2 text-[11px] font-semibold border-b border-white/10 bg-white/5 uppercase tracking-[0.25em] text-muted-foreground">
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

									<ResizableHandle withHandle className="bg-white/10" />

									<ResizablePanel
										defaultSize={80}
										minSize={32}
										className="relative overflow-hidden bg-gradient-to-br from-[#05070d]/70 via-[#050a13]/80 to-[#04050a]/70"
									>
										<div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),transparent_55%)]" />
										<div className="absolute inset-0 pointer-events-none opacity-15 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:60px_60px]" />
										<div className="relative z-10 h-full flex flex-col">
											<EditorArea />
										</div>
									</ResizablePanel>
								</ResizablePanelGroup>
							</ResizablePanel>

							<ResizableHandle withHandle className="bg-white/10" />

							{/* Bottom terminal */}
							<ResizablePanel
								ref={terminalRef}
								defaultSize={25}
								minSize={0}
								maxSize={45}
								collapsible
								collapsedSize={4}
								className="border-t border-white/10 bg-[#05060a]/90 backdrop-blur-xl"
							>
								<div className="h-full flex flex-col">
									<div className="p-3 border-b border-white/10 text-[11px] uppercase tracking-[0.4em] text-muted-foreground flex items-center justify-between">
										<span>Terminal</span>
										<span className="text-[9px] text-emerald-300">
											ƒ-motion
										</span>
									</div>
									<div className="flex-1 overflow-hidden">
										<CLI />
									</div>
								</div>
							</ResizablePanel>
						</ResizablePanelGroup>
					) : (
						<div className="flex-1 flex flex-col bg-black/40 backdrop-blur-sm w-full">
							<CLI />
						</div>
					)}
				</div>
				<Taskbar />
			</div>
		</>
	);
}
