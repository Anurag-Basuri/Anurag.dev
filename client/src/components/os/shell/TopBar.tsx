'use client';

import { motion } from 'framer-motion';
import {
	Menu,
	PanelLeftOpen,
	PanelLeftClose,
	Terminal as TerminalIcon,
	ChevronDown,
	Clock,
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
				className="h-8 bg-[#0d1117]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between z-40 shadow-[0_2px_20px_rgba(0,0,0,0.3)] px-2 sm:px-3 select-none"
			>
				<div className="flex items-center gap-2">
					{isMobile && (
						<Sheet open={isExplorerOpen} onOpenChange={setIsExplorerOpen}>
							<SheetTrigger asChild>
								<button
									className="h-7 w-7 flex items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-emerald-400 transition-colors"
									aria-label="Toggle explorer"
								>
									<Menu className="w-3.5 h-3.5" />
								</button>
							</SheetTrigger>
							<SheetContent
								side="left"
								className="w-[260px] p-0 bg-[#0d1117]/95 backdrop-blur-md border-r border-white/10"
							>
								<div className="p-3 text-[11px] font-semibold border-b border-white/10 bg-white/5 uppercase tracking-wider text-white/40">
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
					<span className="font-bold tracking-[0.25em] sm:tracking-[0.35em] text-xs sm:text-sm text-white/90">
						ANURAGOS
					</span>
				</div>

				{!isMobile && (
					<div className="flex-1 flex justify-center items-center gap-3">
						<div className="flex items-center gap-1.5">
							<Clock className="w-3 h-3 text-emerald-400" />
							<span className="text-white/60 text-[11px] font-mono tracking-wider">
								{currentTime}
							</span>
						</div>
						<button
							onClick={handleContactClick}
							className="h-7 px-2.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-emerald-400 transition-colors text-[10px] sm:text-xs uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
						>
							Contact
						</button>
					</div>
				)}

				<div className="flex items-center gap-1.5 sm:gap-2">
					{/* Status */}
					<div className="flex gap-1.5 items-center pr-2 border-r border-white/10">
						<span
							aria-hidden
							className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_2px_rgba(16,185,129,0.5)]"
						/>
						<span className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-wider">
							Online
						</span>
					</div>

					{/* Theme Toggle */}
					<div className={cn('pr-2', !isMobile && 'border-r border-white/10')}>
						<ThemeToggle />
					</div>

					{/* Desktop Layout Controls */}
					{!isMobile && (
						<>
							{/* Sidebar controls */}
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										className="h-7 w-7 flex items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
										aria-label={
											sidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'
										}
										onClick={onToggleSidebar}
									>
										{sidebarCollapsed ? (
											<PanelLeftOpen className="w-3.5 h-3.5" />
										) : (
											<PanelLeftClose className="w-3.5 h-3.5" />
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
										className="h-7 w-7 flex items-center justify-center rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-emerald-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
										aria-label={
											terminalCollapsed ? 'Show Terminal' : 'Hide Terminal'
										}
										onClick={onToggleTerminal}
									>
										{terminalCollapsed ? (
											<TerminalIcon className="w-3.5 h-3.5" />
										) : (
											<ChevronDown className="w-3.5 h-3.5" />
										)}
									</button>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									<p>{terminalCollapsed ? 'Show Terminal' : 'Hide Terminal'}</p>
								</TooltipContent>
							</Tooltip>
						</>
					)}
				</div>
			</motion.div>
		</TooltipProvider>
	);
}
