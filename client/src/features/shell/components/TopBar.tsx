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

	// Keep UI same, but disconnect “backend-ish” integrations.
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
		<header
			className="h-8 px-20 sm:px-20 bg-[#050505]/80 backdrop-blur-xl backdrop-saturate-150 border-b border-white/5 shadow-sm flex items-center justify-between z-50 select-none relative overflow-hidden animate-in slide-in-from-top-2 duration-500"
			role="banner"
		>
			{/* Decorative gradient borders */}
			<div className="absolute inset-0 pointer-events-none" aria-hidden="true">
				<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-400/30 to-transparent" />
				<div className="absolute inset-y-0 left-0 w-px bg-white/5" />
				<div className="absolute inset-y-0 right-0 w-px bg-white/5" />
			</div>

			{/* Left Section */}
			<div className="flex items-center gap-2.5 min-w-0">
				{isMobile && (
					<Sheet open={isExplorerOpen} onOpenChange={setIsExplorerOpen}>
						<SheetTrigger asChild>
							<button
								className="p-2 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400/40 min-h-[44px] min-w-[44px] flex items-center justify-center"
								aria-label="Open file explorer"
								title="Open file explorer"
							>
								<Menu className="w-5 h-5" aria-hidden="true" />
							</button>
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
					<div className="flex items-center gap-2 group cursor-default">
						<div
							className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-linear-to-tr from-emerald-400 to-emerald-600 shadow-[0_0_8px_rgba(52,211,153,0.55)] group-hover:shadow-[0_0_12px_rgba(52,211,153,0.7)] transition-all duration-300"
							aria-hidden="true"
						/>
						<span className="font-bold tracking-[0.2em] text-[9px] sm:text-[10px] text-white/90 group-hover:text-white transition-colors truncate">
							ANURAG&apos;S <span className="text-emerald-400">PORTFOLIO</span>
						</span>
					</div>
				)}
			</div>

			{/* Center Section: Clock (Hidden on mobile to save space) */}
			{!isMobile && (
				<div className="absolute left-1/2 -translate-x-1/2 flex items-center">
					<div
						className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/5 shadow-sm hover:bg-white/10 transition-colors h-6 cursor-default"
						role="timer"
						aria-live="polite"
						aria-atomic="true"
						title="System Time"
					>
						<Clock className="w-3 h-3 text-emerald-300" aria-hidden="true" />
						<span className="text-[10px] font-medium text-white/90 font-mono tracking-wider tabular-nums">
							{currentTime}
						</span>
					</div>
				</div>
			)}

			{/* Right Section */}
			<div className="flex items-center gap-1.5 sm:gap-2">
				{/* System Status Indicators - Desktop only */}
				<div
					className="hidden sm:flex items-center gap-2.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/5 h-6"
					title={isOnline ? 'System Online' : 'System Offline'}
				>
					<div className="flex items-center gap-1.5 cursor-help" role="status">
						{isOnline ? (
							<span className="relative flex h-2.5 w-2.5" aria-label="System online">
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

					<button
						className="focus:outline-none focus:ring-2 focus:ring-emerald-400/40 rounded-full p-0.5"
						aria-label="Network status"
						title={isOnline ? 'Connected' : 'Disconnected'}
					>
						{isOnline ? (
							<Wifi className="w-3 h-3 text-white/40" aria-hidden="true" />
						) : (
							<WifiOff className="w-3 h-3 text-red-400/60" aria-hidden="true" />
						)}
					</button>

					{batteryLevel < 100 && (
						<button
							className="focus:outline-none focus:ring-2 focus:ring-emerald-400/40 rounded-full p-0.5 flex items-center gap-1"
							aria-label={`Battery level ${batteryLevel}%`}
							title={`Battery: ${batteryLevel}%`}
						>
							<Battery
								className={cn(
									'w-3 h-3',
									batteryLevel > 20 ? 'text-white/40' : 'text-red-400',
								)}
								aria-hidden="true"
							/>
							<span className="text-[8px] font-mono text-white/40">
								{batteryLevel}%
							</span>
						</button>
					)}
				</div>

				{/* Theme Toggle */}
				<div className="hidden sm:flex items-center">
					<ThemeToggle />
				</div>

				{/* Control Panel - Desktop only */}
				{!isMobile && (
					<nav
						className="flex items-center gap-1 bg-white/6 p-1 rounded-lg border border-white/10 shadow-[0_6px_18px_rgba(0,0,0,0.18)]"
						role="navigation"
						aria-label="View controls"
					>
						<button
							onClick={handleContactClick}
							className="h-6 px-2.5 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-[9px] font-bold uppercase tracking-wider text-emerald-200 transition-colors border border-emerald-500/20 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 active:scale-95"
							aria-label="Open contact form"
							title="Get in touch"
						>
							Contact
						</button>

						<div className="w-px h-3.5 bg-white/10 mx-1" aria-hidden="true" />

						<button
							onClick={onToggleSidebar}
							className={cn(
								'h-6 w-7 flex items-center justify-center rounded-md transition-all duration-200 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 active:scale-95',
								sidebarCollapsed
									? 'text-white/45 hover:text-white/70'
									: 'text-emerald-300 bg-white/10 shadow-[0_0_10px_rgba(52,211,153,0.25)]',
							)}
							aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
							aria-pressed={!sidebarCollapsed}
							title={
								sidebarCollapsed
									? 'Expand Sidebar (Ctrl+B)'
									: 'Collapse Sidebar (Ctrl+B)'
							}
						>
							{sidebarCollapsed ? (
								<Folder className="w-3.5 h-3.5" aria-hidden="true" />
							) : (
								<FolderOpen className="w-3.5 h-3.5" aria-hidden="true" />
							)}
						</button>

						<button
							onClick={onToggleTerminal}
							className={cn(
								'h-6 w-7 flex items-center justify-center rounded-md transition-all duration-200 border border-white/10 focus:outline-none focus:ring-2 focus:ring-emerald-400/60 active:scale-95',
								terminalCollapsed
									? 'text-white/45 hover:text-white/70'
									: 'text-emerald-300 bg-white/10 shadow-[0_0_10px_rgba(52,211,153,0.25)]',
							)}
							aria-label={terminalCollapsed ? 'Expand terminal' : 'Collapse terminal'}
							aria-pressed={!terminalCollapsed}
							title={terminalCollapsed ? 'Expand Terminal' : 'Collapse Terminal'}
						>
							{terminalCollapsed ? (
								<TerminalIcon className="w-3.5 h-3.5" aria-hidden="true" />
							) : (
								<ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
							)}
						</button>
					</nav>
				)}
			</div>
		</header>
	);
});
