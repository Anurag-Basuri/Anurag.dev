'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useAtom } from 'jotai';
import { mobileSidebarOpenAtom } from '@/store';
import {
	Menu,
	Terminal as TerminalIcon,
	ChevronDown,
	Clock,
	Wifi,
	WifiOff,
	Battery,
	Folder,
	FolderOpen,
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FolderTree, SidebarProfile } from '@/features/sidebar';
import { INITIAL_FILE_SYSTEM, type FileSystemItem } from '@/data/filesystem';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';

interface TopBarProps {
	isMobile: boolean;
	sidebarCollapsed: boolean;
	terminalCollapsed: boolean;
	onToggleSidebar: () => void;
	onToggleTerminal: () => void;
	onFileSelect: (item: FileSystemItem) => void;
}

export const TopBar = memo(function TopBar({
	isMobile,
	sidebarCollapsed,
	terminalCollapsed,
	onToggleSidebar,
	onToggleTerminal,
	onFileSelect,
}: TopBarProps) {
	const [isExplorerOpen, setIsExplorerOpen] = useAtom(mobileSidebarOpenAtom);
	const [currentTime, setCurrentTime] = useState('');

	// Keep UI same, but disconnect "backend-ish" integrations.
	const batteryLevel = 100;
	const isOnline = true;

	// Update time
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

	const handleContactClick = useCallback(() => {
		const contactItem: FileSystemItem = {
			id: 'contact',
			name: 'contact',
			type: 'file',
			moduleId: 'contact',
		};
		onFileSelect(contactItem);
	}, [onFileSelect]);

	// Close sheet with Escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isExplorerOpen) setIsExplorerOpen(false);
		};
		window.addEventListener('keydown', handleEscape);
		return () => window.removeEventListener('keydown', handleEscape);
	}, [isExplorerOpen, setIsExplorerOpen]);

	return (
		<TooltipProvider delayDuration={300}>
			<header
				className="h-8 px-4 sm:px-4 lg:px-6 bg-[#050505]/80 backdrop-blur-xl backdrop-saturate-150 border-b border-white/5 shadow-sm flex items-center justify-between z-50 select-none relative"
				role="banner"
			>
				{/* Bottom gradient border */}
				<div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-emerald-500/30 to-transparent" />

				{/* Left Section */}
				<div className="flex items-center gap-2 md:gap-2.5 min-w-0">
					{isMobile && (
						<Sheet open={isExplorerOpen} onOpenChange={setIsExplorerOpen}>
							<SheetTrigger asChild>
								<Tooltip>
									<TooltipTrigger asChild>
										<button
											className="p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 hover:scale-105 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400/40 min-h-[44px] min-w-[44px] flex items-center justify-center active:scale-95"
											aria-label="Open file explorer"
										>
											<Menu className="w-5 h-5" aria-hidden="true" />
										</button>
									</TooltipTrigger>
									<TooltipContent side="bottom">
										<p>Open Explorer</p>
									</TooltipContent>
								</Tooltip>
							</SheetTrigger>

							<SheetContent
								side="left"
								className="w-[min(320px,85vw)] p-0 bg-background/95 backdrop-blur-xl border-r border-border/20 flex flex-col"
							>
								<SheetTitle className="sr-only">File Explorer</SheetTitle>

								<div className="shrink-0">
									<SidebarProfile />
								</div>

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

								<div className="p-4 border-t border-white/10 flex items-center justify-between bg-white/5">
									<span className="text-xs text-muted-foreground font-medium">
										Theme
									</span>
									<ThemeToggle />
								</div>
							</SheetContent>
						</Sheet>
					)}

					{/* Branding */}
					{!isMobile && (
						<div className="flex items-center gap-2 group cursor-default min-w-0">
							<div className="w-4 h-4 sm:w-[18px] sm:h-[18px] relative shrink-0">
								<Image
									src="/logo.png"
									alt="AnuragOS"
									fill
									sizes="18px"
									className="object-contain"
									priority
								/>
							</div>

							<span className="font-bold tracking-[0.2em] text-[9px] sm:text-[10px] text-white/90 group-hover:text-white transition-colors truncate">
								ANURAG&apos;S <span className="text-emerald-400">PORTFOLIO</span>
							</span>
						</div>
					)}
				</div>

				{/* Center Section: Clock (Desktop centered, Mobile in right section) */}
				{!isMobile && (
					<div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center">
						<Tooltip>
							<TooltipTrigger asChild>
								<div
									className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 shadow-sm hover:bg-white/10 hover:shadow-[0_0_12px_rgba(52,211,153,0.15)] hover:border-emerald-500/20 transition-all duration-200 h-6 cursor-default group"
									role="timer"
									aria-live="polite"
									aria-atomic="true"
								>
									<Clock
										className="w-3 h-3 text-emerald-300 group-hover:text-emerald-400 transition-colors"
										aria-hidden="true"
									/>
									<span className="text-[10px] font-medium text-white/90 font-mono tracking-wider tabular-nums group-hover:text-white transition-colors">
										{currentTime}
									</span>
								</div>
							</TooltipTrigger>
							<TooltipContent side="bottom">
								<p>System Time</p>
							</TooltipContent>
						</Tooltip>
					</div>
				)}

				{/* Right Section */}
				<div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
					{/* Mobile Clock - Compact version */}
					{isMobile && (
						<Tooltip>
							<TooltipTrigger asChild>
								<div
									className="flex md:hidden items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/5 h-6 cursor-default"
									role="timer"
									aria-live="polite"
								>
									<Clock
										className="w-3 h-3 text-emerald-300"
										aria-hidden="true"
									/>
									<span className="text-[10px] font-medium text-white/90 font-mono tracking-wider tabular-nums">
										{currentTime}
									</span>
								</div>
							</TooltipTrigger>
							<TooltipContent side="bottom">
								<p>System Time</p>
							</TooltipContent>
						</Tooltip>
					)}

					{/* System Status Indicators - Tablet/Desktop */}
					<div className="hidden md:flex items-center gap-2 lg:gap-2.5 px-2 lg:px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 h-6 hover:bg-white/8 transition-colors duration-200">
						<Tooltip>
							<TooltipTrigger asChild>
								<div
									className="flex items-center gap-1.5 cursor-help"
									role="status"
								>
									{isOnline ? (
										<span
											className="relative flex h-2.5 w-2.5"
											aria-label="System online"
										>
											<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
											<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
										</span>
									) : (
										<span
											className="relative flex h-2.5 w-2.5 bg-red-500 rounded-full"
											aria-label="System offline"
										/>
									)}
									<span className="text-[9px] uppercase font-bold tracking-[0.15em] text-white/65">
										{isOnline ? 'Online' : 'Offline'}
									</span>
								</div>
							</TooltipTrigger>
							<TooltipContent side="bottom">
								<p>
									{isOnline ? 'System is online and ready' : 'System is offline'}
								</p>
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<button
									className="focus:outline-none focus:ring-2 focus:ring-emerald-400/40 rounded-full p-0.5 hover:scale-110 transition-transform duration-200"
									aria-label="Network status"
								>
									{isOnline ? (
										<Wifi
											className="w-3 h-3 text-white/40 hover:text-white/60 transition-colors"
											aria-hidden="true"
										/>
									) : (
										<WifiOff
											className="w-3 h-3 text-red-400/60"
											aria-hidden="true"
										/>
									)}
								</button>
							</TooltipTrigger>
							<TooltipContent side="bottom">
								<p>{isOnline ? 'Network Connected' : 'Network Disconnected'}</p>
							</TooltipContent>
						</Tooltip>

						{batteryLevel < 100 && (
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										className="focus:outline-none focus:ring-2 focus:ring-emerald-400/40 rounded-full p-0.5 flex items-center gap-1 hover:scale-105 transition-transform duration-200"
										aria-label={`Battery level ${batteryLevel}%`}
									>
										<Battery
											className={cn(
												'w-3 h-3',
												batteryLevel > 20
													? 'text-white/40'
													: 'text-red-400',
											)}
											aria-hidden="true"
										/>
										<span className="text-[8px] font-mono text-white/40">
											{batteryLevel}%
										</span>
									</button>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									<p>Battery: {batteryLevel}%</p>
								</TooltipContent>
							</Tooltip>
						)}
					</div>

					{/* Theme Toggle - visible on every screen size */}
					<div className="flex items-center">
						<ThemeToggle />
					</div>

					{/* Control Panel - Tablet/Desktop */}
					{!isMobile && (
						<nav
							className="flex items-center gap-0.5 sm:gap-1 bg-white/6 p-0.5 sm:p-1 rounded-lg border border-white/10 shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
							role="navigation"
							aria-label="View controls"
						>
							<Tooltip>
								<TooltipTrigger asChild>
									<button
										onClick={handleContactClick}
										className="h-6 px-2 sm:px-2.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 hover:shadow-[0_0_12px_rgba(52,211,153,0.3)] text-[9px] font-bold uppercase tracking-wider text-emerald-200 hover:text-emerald-100 transition-all duration-200 border border-emerald-500/20 hover:border-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 active:scale-95 hover:scale-105"
										aria-label="Open contact form"
									>
										Contact
									</button>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									<p>Get in touch</p>
								</TooltipContent>
							</Tooltip>

							<div
								className="w-px h-3.5 bg-white/10 mx-0.5 sm:mx-1"
								aria-hidden="true"
							/>

							<Tooltip>
								<TooltipTrigger asChild>
									<button
										onClick={onToggleSidebar}
										className={cn(
											'h-6 w-7 flex items-center justify-center rounded-md transition-all duration-200 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 active:scale-95 hover:scale-105',
											sidebarCollapsed
												? 'text-white/45 hover:text-white/70 hover:bg-white/5'
												: 'text-emerald-300 bg-white/10 shadow-[0_0_12px_rgba(52,211,153,0.3)] hover:shadow-[0_0_16px_rgba(52,211,153,0.4)]',
										)}
										aria-label={
											sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'
										}
										aria-pressed={!sidebarCollapsed}
									>
										{sidebarCollapsed ? (
											<Folder className="w-3.5 h-3.5" aria-hidden="true" />
										) : (
											<FolderOpen
												className="w-3.5 h-3.5"
												aria-hidden="true"
											/>
										)}
									</button>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									<p>
										{sidebarCollapsed ? 'Expand' : 'Collapse'} Sidebar
										<span className="ml-2 text-xs text-muted-foreground">
											Ctrl+B
										</span>
									</p>
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<button
										onClick={onToggleTerminal}
										className={cn(
											'h-6 w-7 flex items-center justify-center rounded-md transition-all duration-200 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 active:scale-95 hover:scale-105',
											terminalCollapsed
												? 'text-white/45 hover:text-white/70 hover:bg-white/5'
												: 'text-emerald-300 bg-white/10 shadow-[0_0_12px_rgba(52,211,153,0.3)] hover:shadow-[0_0_16px_rgba(52,211,153,0.4)]',
										)}
										aria-label={
											terminalCollapsed
												? 'Expand terminal'
												: 'Collapse terminal'
										}
										aria-pressed={!terminalCollapsed}
									>
										{terminalCollapsed ? (
											<TerminalIcon
												className="w-3.5 h-3.5"
												aria-hidden="true"
											/>
										) : (
											<ChevronDown
												className="w-3.5 h-3.5"
												aria-hidden="true"
											/>
										)}
									</button>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									<p>{terminalCollapsed ? 'Expand' : 'Collapse'} Terminal</p>
								</TooltipContent>
							</Tooltip>
						</nav>
					)}
				</div>
			</header>
		</TooltipProvider>
	);
});
