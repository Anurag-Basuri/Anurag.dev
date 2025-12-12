'use client';

import { useAtom } from 'jotai';
import { mobileSidebarOpenAtom } from '@/store/atoms';
import { motion } from 'framer-motion';
import {
	Menu,
	PanelLeftOpen,
	PanelLeftClose,
	Terminal as TerminalIcon,
	ChevronDown,
	Clock,
	Wifi,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderTree } from '@/components/os/file-system/FolderTree';
import { SidebarProfile } from '@/components/os/shell/SidebarProfile';
import { INITIAL_FILE_SYSTEM, FileSystemItem } from '@/data/filesystem';
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
	const [isExplorerOpen, setIsExplorerOpen] = useAtom(mobileSidebarOpenAtom);
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
			<motion.header
				initial={{ y: -100, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
				className="h-8 bg-[#0d1117]/70 backdrop-blur-2xl border-b border-white/8 flex items-center justify-between z-50 px-2 sm:px-3 select-none relative shadow-[0_5px_20px_-5px_rgba(0,0,0,0.3)]"
			>
				{/* Ambient Glow Line */}
				<div className="absolute bottom-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-emerald-500/20 to-transparent opacity-50" />

				{/* Left Section */}
				<div className="flex items-center gap-3">
					{isMobile && (
						<Sheet open={isExplorerOpen} onOpenChange={setIsExplorerOpen}>
							<SheetTrigger asChild>
								<motion.button
									whileHover={{ scale: 1.05 }}
									whileTap={{ scale: 0.95 }}
									className="p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
								>
									<Menu className="w-4 h-4" />
								</motion.button>
							</SheetTrigger>
							<SheetContent
								side="left"
								className="w-[280px] p-0 bg-[#0d1117]/95 backdrop-blur-xl border-r border-white/10 flex flex-col"
							>
								<SheetTitle className="sr-only">File Explorer</SheetTitle>

								{/* Profile Section */}
								<div className="shrink-0">
									<SidebarProfile />
								</div>

								{/* Folder Tree */}
								<div className="flex-1 overflow-hidden">
									<ScrollArea className="h-full">
										<div className="p-4">
											<FolderTree
												items={INITIAL_FILE_SYSTEM}
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

					<div className="flex items-center gap-2 group cursor-default">
						<div className="w-3 h-3 rounded-full bg-linear-to-tr from-emerald-400 to-emerald-600 shadow-[0_0_8px_rgba(52,211,153,0.4)] group-hover:shadow-[0_0_12px_rgba(52,211,153,0.6)] transition-all duration-300" />
						<span className="font-bold tracking-[0.2em] text-xs text-white/90 group-hover:text-white transition-colors">
							ANURAG<span className="text-emerald-400">OS</span>
						</span>
					</div>
				</div>

				{/* Center Section: Clock & Date */}
				{!isMobile && (
					<div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4">
						<div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/3 border border-white/5 hover:bg-white/5 transition-colors group">
							<Clock className="w-3.5 h-3.5 text-emerald-400/80 group-hover:text-emerald-400 transition-colors" />
							<span className="text-xs font-medium text-white/80 font-mono tracking-wide">
								{currentTime}
							</span>
						</div>
					</div>
				)}

				{/* Right Section */}
				<div className="flex items-center gap-1.5 sm:gap-3">
					{/* Status Indicators */}
					<div className="hidden sm:flex items-center gap-3 px-3 border-r border-white/10 mr-1">
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-1.5 cursor-help">
									<span className="relative flex h-2 w-2">
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
										<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
									</span>
									<span className="text-[10px] uppercase font-bold tracking-wider text-white/50">
										Online
									</span>
								</div>
							</TooltipTrigger>
							<TooltipContent>System Online</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger>
								<Wifi className="w-3.5 h-3.5 text-white/40" />
							</TooltipTrigger>
							<TooltipContent>Connected</TooltipContent>
						</Tooltip>
					</div>

					<ThemeToggle />

					{!isMobile && (
						<div className="flex items-center gap-1 bg-white/3 p-0.5 rounded-lg border border-white/5">
							<Tooltip>
								<TooltipTrigger asChild>
									<motion.button
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										onClick={handleContactClick}
										className="h-6 px-3 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-[10px] font-bold uppercase tracking-wider text-emerald-400 transition-colors border border-emerald-500/20"
									>
										Contact
									</motion.button>
								</TooltipTrigger>
								<TooltipContent>Get in touch</TooltipContent>
							</Tooltip>

							<div className="w-px h-4 bg-white/10 mx-1" />

							<Tooltip>
								<TooltipTrigger asChild>
									<motion.button
										whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
										whileTap={{ scale: 0.95 }}
										onClick={onToggleSidebar}
										className={cn(
											'h-6 w-6 flex items-center justify-center rounded-md transition-colors',
											sidebarCollapsed
												? 'text-white/40'
												: 'text-emerald-400 bg-white/5',
										)}
									>
										{sidebarCollapsed ? (
											<PanelLeftOpen className="w-3.5 h-3.5" />
										) : (
											<PanelLeftClose className="w-3.5 h-3.5" />
										)}
									</motion.button>
								</TooltipTrigger>
								<TooltipContent>
									{sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<motion.button
										whileHover={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
										whileTap={{ scale: 0.95 }}
										onClick={onToggleTerminal}
										className={cn(
											'h-6 w-6 flex items-center justify-center rounded-md transition-colors',
											terminalCollapsed
												? 'text-white/40'
												: 'text-emerald-400 bg-white/5',
										)}
									>
										{terminalCollapsed ? (
											<TerminalIcon className="w-3.5 h-3.5" />
										) : (
											<ChevronDown className="w-3.5 h-3.5" />
										)}
									</motion.button>
								</TooltipTrigger>
								<TooltipContent>
									{terminalCollapsed ? 'Expand Terminal' : 'Collapse Terminal'}
								</TooltipContent>
							</Tooltip>
						</div>
					)}
				</div>
			</motion.header>
		</TooltipProvider>
	);
}
