'use client';

import { useSetAtom } from 'jotai';
import { windowStateAtom, bootCompleteAtom } from '@/boot/atoms';
import { ThemeSelector } from '@/theme/colors/ThemeSelector';
import { BackgroundSelector } from '@/theme/backgrounds/BackgroundSelector';
import { Maximize2, Cpu, FileText } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/ui/tooltip';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function TopBar() {
	const setWindowState = useSetAtom(windowStateAtom);
	const setBootComplete = useSetAtom(bootCompleteAtom);
	const pathname = usePathname();
	const isPortfolioShell = pathname.startsWith('/portfolio');

	const toggleFullscreen = () => {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen().catch(() => {});
		} else if (document.exitFullscreen) {
			document.exitFullscreen();
		}
	};

	return (
		<TooltipProvider delayDuration={300}>
			<header className="h-10 w-full flex items-center justify-between px-2 sm:px-4 shrink-0 z-30 relative">
				{/* Dedicated blur plane prevents stacking context trapping for nested dropdowns */}
				<div className="absolute inset-0 bg-background/30 backdrop-blur-xl border-b border-border -z-10 pointer-events-none" />

				{/* Left: window controls + title */}
				<div className="flex items-center gap-2 sm:gap-4 shrink-0 overflow-hidden">
					<div className="flex gap-2 items-center group shrink-0">
						{isPortfolioShell && (
							<>
								<Tooltip>
									<TooltipTrigger asChild>
										<button
											onClick={() => setBootComplete(false)}
											className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500/80 hover:bg-red-400 transition-colors flex items-center justify-center border border-foreground/10 shrink-0"
											aria-label="Restart Boot"
										/>
									</TooltipTrigger>
									<TooltipContent side="bottom" sideOffset={12}>Restart System</TooltipContent>
								</Tooltip>

								<Tooltip>
									<TooltipTrigger asChild>
										<button
											onClick={() => setWindowState('minimized')}
											className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-400 transition-colors flex items-center justify-center border border-foreground/10 shrink-0"
											aria-label="Minimize"
										/>
									</TooltipTrigger>
									<TooltipContent side="bottom" sideOffset={12}>Minimize App</TooltipContent>
								</Tooltip>
							</>
						)}
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									onClick={toggleFullscreen}
									className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500/80 hover:bg-green-400 transition-colors flex items-center justify-center border border-foreground/10 relative overflow-hidden group/fs shrink-0"
									aria-label="Fullscreen"
								>
									<Maximize2 className="w-[8px] h-[8px] sm:w-2 sm:h-2 text-green-900 opacity-0 group-hover/fs:opacity-100 transition-opacity absolute" />
								</button>
							</TooltipTrigger>
							<TooltipContent side="bottom" sideOffset={12}>Toggle Fullscreen</TooltipContent>
						</Tooltip>
					</div>
					<div className="h-4 w-px bg-border hidden sm:block shrink-0" />
					<Link href="/portfolio" className="text-xs sm:text-sm font-bold tracking-wider uppercase text-foreground/80 hidden sm:block leading-none truncate hover:opacity-80 transition-opacity cursor-pointer">
						Anurag<span className="text-primary">.dev</span>
					</Link>
				</div>

				{/* Right: nav actions + theme selector */}
				<div className="flex items-center gap-3 sm:gap-4 shrink-0">
					<Tooltip>
						<TooltipTrigger asChild>
							<Link
								href="/readme"
								className="transition-colors flex items-center justify-center group relative shrink-0"
								style={{ color: 'var(--theme-primary)' }}
								aria-label="System Diagnostics"
							>
								<div className="absolute inset-0 blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'color-mix(in oklch, var(--theme-primary) 20%, transparent)' }} />
								<Cpu className="w-4 h-4 sm:w-[18px] sm:h-[18px] relative z-10" strokeWidth={2.5} />
							</Link>
						</TooltipTrigger>
						<TooltipContent side="bottom" sideOffset={12}>System Diagnostics</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Link
								href="/resume"
								className="transition-colors flex items-center justify-center group relative shrink-0"
								style={{ color: 'var(--theme-primary)' }}
								aria-label="Interactive Resume"
							>
								<div className="absolute inset-0 blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'color-mix(in oklch, var(--theme-primary) 20%, transparent)' }} />
								<FileText className="w-4 h-4 sm:w-[18px] sm:h-[18px] relative z-10" strokeWidth={2.5} />
							</Link>
						</TooltipTrigger>
						<TooltipContent side="bottom" sideOffset={12}>Interactive Resume</TooltipContent>
					</Tooltip>

					<div className="w-px h-3.5 bg-border hidden sm:block shrink-0" />

					<Tooltip>
						<TooltipTrigger asChild>
							<button
								onClick={() => {
									window.dispatchEvent(
										new CustomEvent('scroll-to-section', {
											detail: { sectionId: 'contact' },
										}),
									);
								}}
								className="px-2.5 sm:px-3 py-1 bg-primary/10 text-primary border border-primary/20 hover:border-primary/50 rounded-full font-bold tracking-widest uppercase text-[9px] sm:text-[10px] transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_-3px_var(--theme-primary)] hover:shadow-[0_0_20px_0_var(--theme-primary)] shrink-0"
							>
								Contact
							</button>
						</TooltipTrigger>
						<TooltipContent side="bottom" sideOffset={12}>Open Secure Channel</TooltipContent>
					</Tooltip>

					<BackgroundSelector />
					<ThemeSelector />
				</div>
			</header>
		</TooltipProvider>
	);
}
