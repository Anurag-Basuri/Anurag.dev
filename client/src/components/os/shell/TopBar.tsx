'use client';

import { motion } from 'framer-motion';
import {
	Menu,
	PanelLeftOpen,
	PanelLeftClose,
	Terminal as TerminalIcon,
	ChevronDown,
	Clock,
	Search,
	Bell,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderTree } from '@/components/os/file-system/FolderTree';
import { initialFileSystem, FileSystemItem } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface TopBarProps {
	isMobile: boolean;
	sidebarCollapsed: boolean;
	terminalCollapsed: boolean;
	onToggleSidebar: () => void;
	onToggleTerminal: () => void;
	onFileSelect: (item: FileSystemItem) => void;
}

export function TopBar({
	isMobile,
	sidebarCollapsed,
	terminalCollapsed,
	onToggleSidebar,
	onToggleTerminal,
	onFileSelect,
}: TopBarProps) {
	const [isExplorerOpen, setIsExplorerOpen] = useState(false);
	const [currentTime, setCurrentTime] = useState('');

	useEffect(() => {
		const updateTime = () => {
			const now = new Date();
			setCurrentTime(
				now.toLocaleTimeString('en-US', {
					hour: '2-digit',
					minute: '2-digit',
					hour12: false,
				}),
			);
		};
		updateTime();
		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	}, []);

	const handleContactClick = () => {
		const contactItem = {
			id: 'contact',
			name: 'contact',
			type: 'file',
		} as FileSystemItem;
		onFileSelect(contactItem);
	};

	return (
		<TooltipProvider delayDuration={0}>
			<motion.div
				initial={{ y: -28, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
			>
				<div className="h-full px-2 sm:px-4 bg-background/80 backdrop-blur-md border-b border-border/40 flex items-center justify-between z-40 select-none">
					<div className="flex items-center gap-3">
						{isMobile && (
							<Sheet open={isExplorerOpen} onOpenChange={setIsExplorerOpen}>
								<SheetTrigger asChild>
									<button
										className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
										aria-label="Toggle explorer"
									>
										<Menu className="w-4 h-4" />
									</button>
								</SheetTrigger>
								<SheetContent
									side="left"
									className="w-[280px] p-0 bg-sidebar border-r border-border"
								>
									<div className="p-4 text-xs font-bold border-b border-border bg-sidebar-accent/10 uppercase tracking-widest text-sidebar-foreground/70">
										Explorer
									</div>
									<div className="flex-1 overflow-hidden">
										<ScrollArea className="h-[calc(100vh-12rem)]">
											<div className="p-2">
												<FolderTree
													items={initialFileSystem}
													onSelect={item => {
														onFileSelect(item);
														setIsExplorerOpen(false);
													}}
												/>
											</div>
										</ScrollArea>
									</div>
								</SheetContent>
							</Sheet>
						)}
						<span className="font-bold tracking-[0.2em] text-sm text-foreground/90 flex items-center gap-2">
							<span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
							ANURAGOS
						</span>
					</div>

					{!isMobile && (
						<div className="flex-1 flex justify-center items-center gap-6">
							<div className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors group cursor-default">
								<Clock className="w-3.5 h-3.5 text-primary group-hover:text-primary/80 transition-colors" />
								<span className="text-muted-foreground text-xs font-mono font-medium">
									{currentTime}
								</span>
							</div>

							{/* Search Bar Placeholder */}
							<div className="relative group w-64 hidden md:block">
								<div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
									<Search className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary/60 transition-colors" />
								</div>
								<input
									type="text"
									placeholder="Search system..."
									className="block w-full pl-8 pr-3 py-1 bg-muted/20 border border-border/30 rounded-md text-xs text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40 focus:bg-muted/40 transition-all"
									disabled
								/>
								<div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
									<span className="text-[10px] text-muted-foreground/40 bg-muted/30 px-1 rounded">
										⌘K
									</span>
								</div>
							</div>

							<button
								onClick={handleContactClick}
								className="px-3 py-1 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium transition-colors border border-primary/20 hover:border-primary/40"
							>
								Contact Me
							</button>
						</div>
					)}

					<div className="flex items-center gap-3">
						{/* Status */}
						<div className="flex gap-2 items-center pr-3 border-r border-border/40">
							<span aria-hidden className="relative flex h-2 w-2">
								<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
								<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
							</span>
							<span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
								Online
							</span>
						</div>

						{/* Theme Toggle */}
						<div className={cn('pr-1', !isMobile && 'border-r border-border/40')}>
							<ThemeToggle />
						</div>

						{/* Desktop Layout Controls */}
						{!isMobile && (
							<>
								{/* Sidebar controls */}
								<Tooltip>
									<TooltipTrigger asChild>
										<button
											className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
											aria-label={
												sidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'
											}
											onClick={onToggleSidebar}
										>
											{sidebarCollapsed ? (
												<PanelLeftOpen className="w-4 h-4" />
											) : (
												<PanelLeftClose className="w-4 h-4" />
											)}
										</button>
									</TooltipTrigger>
									<TooltipContent side="bottom">
										<p>{sidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}</p>
									</TooltipContent>
								</Tooltip>

								{/* Terminal controls */}
								<Tooltip>
									<TooltipTrigger asChild>
										<button
											className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
											aria-label={
												terminalCollapsed
													? 'Show Terminal'
													: 'Hide Terminal'
											}
											onClick={onToggleTerminal}
										>
											{terminalCollapsed ? (
												<TerminalIcon className="w-4 h-4" />
											) : (
												<ChevronDown className="w-4 h-4" />
											)}
										</button>
									</TooltipTrigger>
									<TooltipContent side="bottom">
										<p>
											{terminalCollapsed ? 'Show Terminal' : 'Hide Terminal'}
										</p>
									</TooltipContent>
								</Tooltip>
							</>
						)}
					</div>
				</div>
			</motion.div>
		</TooltipProvider>
	);
}
