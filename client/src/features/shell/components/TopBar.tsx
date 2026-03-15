'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import { useAtom } from 'jotai';
import { mobileSidebarOpenAtom } from '@/store';
import { Clock, Mail } from 'lucide-react';
import dynamic from 'next/dynamic';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Image from 'next/image';
import { StatusBar } from './StatusBar';
import { MobileExplorerSheet } from './MobileExplorerSheet';
import { cn } from '@/lib/utils';

const ThemeToggle = dynamic(() => import('@/components/ui/theme-toggle').then(m => m.ThemeToggle), {
	ssr: false,
	loading: () => <div className="h-7 w-7 rounded-md bg-muted/50 animate-pulse" />,
});

interface TopBarProps {
	isMobile: boolean;
	onNavigate: (moduleId: string) => void;
}

export const TopBar = memo(function TopBar({ isMobile, onNavigate }: TopBarProps) {
	const [isExplorerOpen, setIsExplorerOpen] = useAtom(mobileSidebarOpenAtom);
	const [currentTime, setCurrentTime] = useState('');
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
		const updateTime = () => {
			setCurrentTime(
				new Date().toLocaleTimeString('en-US', {
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
		onNavigate('contact');
	}, [onNavigate]);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isExplorerOpen) setIsExplorerOpen(false);
		};
		window.addEventListener('keydown', handleEscape);
		return () => window.removeEventListener('keydown', handleEscape);
	}, [isExplorerOpen, setIsExplorerOpen]);

	return (
		<TooltipProvider delayDuration={300}>
			<header className="h-8 px-2 sm:px-3 md:px-4 bg-background/90 backdrop-blur-xl border-b border-border/40 flex items-center justify-between z-50 select-none">
				{/* Left: Menu + Logo */}
				<div className="flex items-center gap-2 min-w-0">
					{isMobile && (
						<MobileExplorerSheet
							isOpen={isExplorerOpen}
							onOpenChange={setIsExplorerOpen}
							onNavigate={onNavigate}
						/>
					)}

					{!isMobile && (
						<div className="flex items-center gap-2 group cursor-default">
							<div className="w-5 h-5 relative shrink-0">
								<Image
									src="/logo.png"
									alt="Logo"
									fill
									sizes="20px"
									className="object-contain"
									priority
								/>
							</div>
							<span className="text-[10px] font-bold tracking-wider text-foreground/80 group-hover:text-foreground transition-colors hidden sm:block">
								ANURAG&apos;S <span className="text-primary">PORTFOLIO</span>
							</span>
						</div>
					)}
				</div>

				{/* Center: Clock */}
				{!isMobile && (
					<div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center">
						{!mounted ? (
							<div className="h-6 w-14 rounded-full bg-muted/40 animate-pulse" />
						) : (
							<Tooltip>
								<TooltipTrigger asChild>
									<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/40 border border-border/30 text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors cursor-default">
										<Clock className="w-3 h-3 text-primary/60" />
										<span className="tabular-nums">{currentTime}</span>
									</div>
								</TooltipTrigger>
								<TooltipContent side="bottom">System Time</TooltipContent>
							</Tooltip>
						)}
					</div>
				)}

				{/* Right: Status + Theme + Contact */}
				<div className="flex items-center gap-1.5">
					{/* Mobile Clock */}
					{isMobile && mounted && (
						<div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted/40 border border-border/30 text-[10px] font-mono text-muted-foreground">
							<Clock className="w-2.5 h-2.5 text-primary/60" />
							<span className="tabular-nums">{currentTime}</span>
						</div>
					)}

					<StatusBar isOnline={true} batteryLevel={100} />
					<ThemeToggle />

					{!isMobile && (
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									onClick={handleContactClick}
									className={cn(
										'h-7 px-2.5 rounded-md flex items-center gap-1.5',
										'text-xs font-medium text-muted-foreground',
										'hover:text-foreground hover:bg-muted/50 transition-colors',
									)}
								>
									<Mail className="w-3.5 h-3.5" />
									<span className="hidden lg:block">Contact</span>
								</button>
							</TooltipTrigger>
							<TooltipContent side="bottom">Get in Touch</TooltipContent>
						</Tooltip>
					)}
				</div>
			</header>
		</TooltipProvider>
	);
});
