'use client';

import { useSetAtom } from 'jotai';
import { windowStateAtom, bootCompleteAtom } from '@/boot/atoms';
import { ThemeSelector } from '@/theme/colors/ThemeSelector';
import { BackgroundSelector } from '@/theme/backgrounds/BackgroundSelector';
import { Maximize2, TerminalSquare } from 'lucide-react';
import Link from 'next/link';

export function TopBar() {
	const setWindowState = useSetAtom(windowStateAtom);
	const setBootComplete = useSetAtom(bootCompleteAtom);

	const toggleFullscreen = () => {
		if (!document.fullscreenElement) {
			document.documentElement.requestFullscreen().catch(() => {});
		} else if (document.exitFullscreen) {
			document.exitFullscreen();
		}
	};

	return (
		<header className="h-10 w-full bg-black/20 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-30 relative">
			{/* Left: window controls + title */}
			<div className="flex items-center gap-4">
				<div className="flex gap-2 items-center group">
					<button
						onClick={() => setBootComplete(false)}
						className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-400 transition-colors flex items-center justify-center border border-white/10"
						aria-label="Restart Boot"
					/>
					<button
						onClick={() => setWindowState('minimized')}
						className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-400 transition-colors flex items-center justify-center border border-white/10"
						aria-label="Minimize"
					/>
					<button
						onClick={toggleFullscreen}
						className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-400 transition-colors flex items-center justify-center border border-white/10 relative overflow-hidden"
						aria-label="Fullscreen"
					>
						<Maximize2 className="w-2 h-2 text-green-900 opacity-0 group-hover:opacity-100 transition-opacity absolute" />
					</button>
				</div>
				<div className="h-4 w-px bg-white/10 hidden sm:block" />
				<span className="text-xs sm:text-sm font-bold tracking-wider uppercase text-foreground/80 hidden sm:block leading-none">
					Anurag<span className="text-primary">.dev</span>
				</span>
			</div>

			{/* Right: nav actions + theme selector */}
			<div className="flex items-center gap-3 sm:gap-4">
				<Link
					href="/readme"
					className="text-emerald-500/80 hover:text-emerald-400 transition-colors flex items-center justify-center group relative"
					aria-label="System Diagnostics (README)"
				>
					<div className="absolute inset-0 bg-emerald-500/20 blur rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
					<TerminalSquare className="w-4 h-4 sm:w-[18px] sm:h-[18px] relative z-10" strokeWidth={2.5} />
				</Link>

				<div className="w-px h-3.5 bg-white/10 hidden sm:block" />

				<button
					onClick={() => {
						window.dispatchEvent(
							new CustomEvent('scroll-to-section', {
								detail: { sectionId: 'contact' },
							}),
						);
					}}
					className="text-[11px] sm:text-xs font-bold tracking-widest uppercase text-muted-foreground hover:text-emerald-400 transition-colors"
				>
					Contact
				</button>

				<BackgroundSelector />
				<ThemeSelector />
			</div>
		</header>
	);
}
