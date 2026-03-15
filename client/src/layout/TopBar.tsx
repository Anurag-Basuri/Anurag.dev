'use client';

import { ThemeSelector } from '@/theme/ThemeSelector';

export function TopBar() {
	return (
		<header className="h-12 w-full bg-background/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-4 shrink-0 z-30 relative">
			{/* Left: window controls + title */}
			<div className="flex items-center gap-3">
				<div className="flex gap-1.5 items-center bg-white/5 px-2 py-1 rounded-md border border-white/10">
					<div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
					<div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
					<div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
				</div>
				<span className="text-sm font-semibold tracking-wide text-foreground/80 hidden sm:block">
					anurag-os
				</span>
			</div>

			{/* Right: nav actions + theme selector */}
			<div className="flex items-center gap-4">
				<button
					onClick={() => {
						window.dispatchEvent(
							new CustomEvent('scroll-to-section', {
								detail: { sectionId: 'contact' },
							}),
						);
					}}
					className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
				>
					Contact
				</button>

				<ThemeSelector />
			</div>
		</header>
	);
}
