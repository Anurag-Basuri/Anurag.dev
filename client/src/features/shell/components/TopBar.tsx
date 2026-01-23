'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useAtom } from 'jotai';
import { mobileSidebarOpenAtom } from '@/store';
import { Clock } from 'lucide-react';
import dynamic from 'next/dynamic';
import { type FileSystemItem } from '@/data/filesystem';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';
import { StatusBar } from './StatusBar';
import { MobileExplorerSheet } from './MobileExplorerSheet';

const ThemeToggleDynamic = dynamic(
	() => import('@/components/ui/theme-toggle').then(mod => mod.ThemeToggle),
	{
		ssr: false,
		loading: () => <div className="h-8 w-8 rounded-lg bg-muted/60 animate-pulse" />,
	},
);

interface TopBarProps {
	isMobile: boolean;
	onFileSelect: (item: FileSystemItem) => void;
}

export const TopBar = memo(function TopBar({ isMobile, onFileSelect }: TopBarProps) {
	const [isExplorerOpen, setIsExplorerOpen] = useAtom(mobileSidebarOpenAtom);
	const [currentTime, setCurrentTime] = useState('');

	const [mounted, setMounted] = useState(false);

	// Static values for UI consistency
	const batteryLevel = 100;
	const isOnline = true;

	// Handle hydration
	useEffect(() => {
		setMounted(true);
	}, []);

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
				className="h-8 px-2 sm:px-3 md:px-4 lg:px-6 bg-background/80 backdrop-blur-xl backdrop-saturate-150 border-b border-border/50 shadow-sm flex items-center justify-between z-50 select-none relative"
				role="banner"
			>
				{/* Bottom gradient border */}
				<div className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-primary/30 to-transparent" />

				{/* Left Section */}
				<div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 min-w-0">
					{isMobile && (
						<MobileExplorerSheet
							isOpen={isExplorerOpen}
							onOpenChange={setIsExplorerOpen}
							onFileSelect={onFileSelect}
						/>
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
							<span className="font-bold tracking-[0.2em] text-[9px] sm:text-[10px] text-foreground/90 group-hover:text-foreground transition-colors truncate">
								ANURAG&apos;S <span className="text-primary">PORTFOLIO</span>
							</span>
						</div>
					)}
				</div>

				{/* Center Section: Clock (Desktop only) */}
				{!isMobile && (
					<div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center">
						{!mounted ? (
							<div className="h-6 w-16 rounded-full bg-muted/50 animate-pulse" />
						) : (
							<Tooltip>
								<TooltipTrigger asChild>
									<div
										className="flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 border border-border/50 shadow-sm hover:bg-muted hover:shadow-md hover:border-primary/20 transition-all duration-200 h-6 cursor-default group"
										role="timer"
										aria-live="polite"
										aria-atomic="true"
									>
										<Clock
											className="w-3 h-3 text-primary/70 group-hover:text-primary transition-colors"
											aria-hidden="true"
										/>
										<span className="text-[10px] font-medium text-foreground/90 font-mono tracking-wider tabular-nums group-hover:text-foreground transition-colors">
											{currentTime}
										</span>
									</div>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									<p>System Time</p>
								</TooltipContent>
							</Tooltip>
						)}
					</div>
				)}

				{/* Right Section */}
				<div className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
					{/* Mobile Clock */}
					{isMobile &&
						(!mounted ? (
							<div className="h-6 w-16 rounded-full bg-muted/50 animate-pulse md:hidden" />
						) : (
							<Tooltip>
								<TooltipTrigger asChild>
									<div
										className="flex md:hidden items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/50 border border-border/50 h-6 cursor-default"
										role="timer"
										aria-live="polite"
									>
										<Clock
											className="w-3 h-3 text-primary/70"
											aria-hidden="true"
										/>
										<span className="text-[10px] font-medium text-foreground/90 font-mono tracking-wider tabular-nums">
											{currentTime}
										</span>
									</div>
								</TooltipTrigger>
								<TooltipContent side="bottom">
									<p>System Time</p>
								</TooltipContent>
							</Tooltip>
						))}

					{/* System Status Indicators - Desktop */}
					<StatusBar isOnline={isOnline} batteryLevel={batteryLevel} />

					{/* Theme Toggle */}
					<div className="flex items-center">
						<ThemeToggleDynamic />
					</div>

					{/* Contact Button - Desktop */}
					{!isMobile && (
						<button
							onClick={handleContactClick}
							className="flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium text-foreground/70 hover:text-foreground hover:bg-muted/50 transition-colors"
						>
							Contact
						</button>
					)}
				</div>
			</header>
		</TooltipProvider>
	);
});
