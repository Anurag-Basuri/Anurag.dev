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
				initial={{ y: -80, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
				className="h-11 px-3 sm:px-4 bg-gradient-to-r from-background/90 via-background/75 to-background/90 backdrop-blur-xl border-b border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.35)] flex items-center justify-between z-50 select-none relative overflow-hidden"
			>
				{/* Ambient layers */}
				<div className="absolute inset-0 pointer-events-none">
					<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/30 to-transparent" />
					<div className="absolute inset-y-0 left-0 w-px bg-white/5" />
					<div className="absolute inset-y-0 right-0 w-px bg-white/5" />
				</div>

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
								className="w-[280px] p-0 bg-background/95 backdrop-blur-xl border-r border-border/20 flex flex-col"
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
						<div className="w-3.5 h-3.5 rounded-full bg-linear-to-tr from-emerald-400 to-emerald-600 shadow-[0_0_10px_rgba(52,211,153,0.55)] group-hover:shadow-[0_0_14px_rgba(52,211,153,0.7)] transition-all duration-300" />
						<span className="font-bold tracking-[0.22em] text-[11px] text-white/90 group-hover:text-white transition-colors">
							ANURAG<span className="text-emerald-400">OS</span>
						</span>
					</div>
				</div>

				{/* Center Section: Clock & Date */}
				{!isMobile && (
					<div className="absolute left-1/2 -translate-x-1/2 flex items-center">
						<div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 shadow-[0_6px_18px_rgba(0,0,0,0.25)] hover:bg-white/8 transition-colors">
							<Clock className="w-4 h-4 text-emerald-300" />
							<span className="text-xs font-semibold text-white/85 font-mono tracking-[0.14em]">
								{currentTime}
							</span>
						</div>
					</div>
				)}

				{/* Right Section */}
				<div className="flex items-center gap-1.5 sm:gap-3">
					<div className="hidden sm:flex items-center gap-3 px-3 py-1 rounded-full bg-white/5 border border-white/10 shadow-inner">
						<Tooltip>
							<TooltipTrigger asChild>
								<div className="flex items-center gap-2 cursor-help">
									<span className="relative flex h-2.5 w-2.5">
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
										<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
									</span>
									<span className="text-[10px] uppercase font-bold tracking-[0.2em] text-white/65">
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

					<div className="hidden sm:flex items-center">
						<ThemeToggle />
					</div>

					{!isMobile && (
						<div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10 shadow-[0_6px_18px_rgba(0,0,0,0.2)]">
							<Tooltip>
								<TooltipTrigger asChild>
									<motion.button
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										onClick={handleContactClick}
										className="h-7 px-3 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-200 transition-colors border border-emerald-500/30 shadow-inner"
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
										whileHover={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
										whileTap={{ scale: 0.95 }}
										onClick={onToggleSidebar}
										className={cn(
											'h-7 w-7 flex items-center justify-center rounded-md transition-colors border border-white/10',
											sidebarCollapsed
												? 'text-white/45'
												: 'text-emerald-300 bg-white/10 shadow-[0_0_10px_rgba(52,211,153,0.25)]',
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
										whileHover={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
										whileTap={{ scale: 0.95 }}
										onClick={onToggleTerminal}
										className={cn(
											'h-7 w-7 flex items-center justify-center rounded-md transition-colors border border-white/10',
											terminalCollapsed
												? 'text-white/45'
												: 'text-emerald-300 bg-white/10 shadow-[0_0_10px_rgba(52,211,153,0.25)]',
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
