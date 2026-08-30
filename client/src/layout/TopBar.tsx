'use client';

import { useSetAtom } from 'jotai';
import { windowStateAtom } from '@/boot/atoms';
import { ThemeSelector } from '@/theme/colors/ThemeSelector';
import { BackgroundSelector } from '@/theme/backgrounds/BackgroundSelector';
import { Maximize2, Cpu, FileText, Zap } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/ui/tooltip';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AGENT_WEBSITE_URL =
	process.env.NEXT_PUBLIC_AGENT_WEBSITE_URL || 'https://cortex-anurag.vercel.app';

// Perfectly-round window control dots at every screen size
function Dot({ color, onClick, label, children }: {
	color: string;
	onClick: () => void;
	label: string;
	children?: React.ReactNode;
}) {
	return (
		<button
			onClick={onClick}
			aria-label={label}
			className="group/dot relative flex items-center justify-center shrink-0 flex-none rounded-full border border-foreground/10 transition-colors"
			style={{ width: 12, height: 12, minWidth: 12, minHeight: 12, backgroundColor: color }}
		>
			{children}
		</button>
	);
}

export function TopBar() {
	const setWindowState = useSetAtom(windowStateAtom);
	
	const pathname = usePathname();
	const isPortfolioShell = pathname.startsWith('/portfolio');

	const toggleFullscreen = () => {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen().catch(() => {});
		} else if (document.exitFullscreen) {
			document.exitFullscreen();
		}
	};

	// Yellow: minimize window, but navigate home first if on a sub-page
	const handleMinimize = () => {
		if (!isPortfolioShell) {
			window.location.href = '/portfolio?window=minimized';
			return;
		}
		setWindowState('minimized');
	};

	// Contact button: scroll if on portfolio, otherwise navigate there
	const goToContact = () => {
		if (isPortfolioShell) {
			window.dispatchEvent(
				new CustomEvent('scroll-to-section', { detail: { sectionId: 'contact' } }),
			);
		} else {
			window.location.href = '/portfolio#contact';
		}
	};

	return (
		<TooltipProvider delayDuration={300}>
			<header className="h-8 w-full flex items-center justify-between px-2.5 sm:px-3 shrink-0 z-30 relative">
				{/* Dedicated blur plane prevents stacking context trapping for nested dropdowns */}
				<div className="absolute inset-0 bg-background/30 backdrop-blur-xl border-b border-border -z-10 pointer-events-none" />

				{/* Left: window controls — title hidden on small screens */}
				<div className="flex items-center gap-2 sm:gap-3 shrink-0">
					{/* Mac-style dots — always visible on every page */}
					<div className="flex items-center gap-1.5">
						<Tooltip>
							<TooltipTrigger asChild>
								<Dot color="rgb(239 68 68 / 0.85)" onClick={() => setWindowState('closed')} label="Close" />
							</TooltipTrigger>
							<TooltipContent side="bottom" sideOffset={12}>Close Window</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Dot color="rgb(234 179 8 / 0.85)" onClick={handleMinimize} label="Minimize" />
							</TooltipTrigger>
							<TooltipContent side="bottom" sideOffset={12}>Minimize App</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<Dot color="rgb(34 197 94 / 0.85)" onClick={toggleFullscreen} label="Fullscreen">
									<Maximize2
										className="opacity-0 group-hover/dot:opacity-100 transition-opacity absolute"
										style={{ width: 7, height: 7, color: 'rgba(0,80,0,0.9)' }}
									/>
								</Dot>
							</TooltipTrigger>
							<TooltipContent side="bottom" sideOffset={12}>Toggle Fullscreen</TooltipContent>
						</Tooltip>
					</div>

					{/* Title — visible only on md+ */}
					<div className="hidden md:flex items-center gap-3 ml-1">
						<div className="h-4 w-px bg-border shrink-0" />
						<Link href="/portfolio" className="text-sm font-bold tracking-wider uppercase text-foreground/80 leading-none hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap">
							Anurag<span className="text-primary">.dev</span>
						</Link>
					</div>
				</div>

				{/* Right: nav actions + selectors */}
				<div className="flex items-center gap-2 sm:gap-3 shrink-0">
					{/* Dedicated Agent App Gateway */}
					<Tooltip>
						<TooltipTrigger asChild>
							<a
								href={AGENT_WEBSITE_URL}
								target="_blank"
								rel="noopener noreferrer"
								className="px-2.5 sm:px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/60 hover:bg-emerald-500/20 rounded-full font-bold tracking-widest uppercase text-[9px] sm:text-[10px] transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_0_rgba(16,185,129,0.5)] shrink-0 whitespace-nowrap flex items-center gap-1.5 cursor-pointer"
							>
								<Zap className="w-3 h-3 text-emerald-400 fill-emerald-400/50" />
								<span>Agent App</span>
							</a>
						</TooltipTrigger>
						<TooltipContent side="bottom" sideOffset={12}>Launch Autonomous AI Agent Website</TooltipContent>
					</Tooltip>

					<div className="w-px h-3.5 bg-border hidden sm:block shrink-0" />

					<Tooltip>
						<TooltipTrigger asChild>
							<Link
								href="/readme"
								className="transition-colors flex items-center justify-center group relative shrink-0 p-1"
								style={{ color: 'var(--theme-primary)' }}
								aria-label="System Diagnostics"
							>
								<div className="absolute inset-0 blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'color-mix(in oklch, var(--theme-primary) 20%, transparent)' }} />
								<Cpu className="w-4 h-4 sm:w-4.5 sm:h-4.5 relative z-10" strokeWidth={2.5} />
							</Link>
						</TooltipTrigger>
						<TooltipContent side="bottom" sideOffset={12}>System Diagnostics</TooltipContent>
					</Tooltip>

					<Tooltip>
						<TooltipTrigger asChild>
							<Link
								href="/resume"
								className="transition-colors flex items-center justify-center group relative shrink-0 p-1"
								style={{ color: 'var(--theme-primary)' }}
								aria-label="Interactive Resume"
							>
								<div className="absolute inset-0 blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'color-mix(in oklch, var(--theme-primary) 20%, transparent)' }} />
								<FileText className="w-4 h-4 sm:w-4.5 sm:h-4.5 relative z-10" strokeWidth={2.5} />
							</Link>
						</TooltipTrigger>
						<TooltipContent side="bottom" sideOffset={12}>Interactive Resume</TooltipContent>
					</Tooltip>

					<div className="w-px h-3.5 bg-border hidden sm:block shrink-0" />

					<Tooltip>
						<TooltipTrigger asChild>
							<button
								onClick={goToContact}
								className="px-2.5 sm:px-3 py-1 bg-primary/10 text-primary border border-primary/20 hover:border-primary/50 rounded-full font-bold tracking-widest uppercase text-[9px] sm:text-[10px] transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_-3px_var(--theme-primary)] hover:shadow-[0_0_20px_0_var(--theme-primary)] shrink-0 whitespace-nowrap cursor-pointer"
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
