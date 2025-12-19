'use client';

// Horizontal version matching CollapsedSidebar style
interface CollapsedTerminalProps {
	onExpand: () => void;
}

export function CollapsedTerminal({ onExpand }: CollapsedTerminalProps) {
	return (
		<div className="h-full w-full flex items-center justify-center bg-linear-to-b from-black/10 to-transparent">
			<button
				onClick={onExpand}
				className="w-full h-full flex items-center justify-center cursor-pointer group outline-none relative"
				aria-label="Expand Terminal"
				title="Expand Terminal (Ctrl+`)"
			>
				{/* Horizontal line that grows on hover with pulsing hint */}
				<div className="relative">
					<div className="h-1 w-96 rounded-full bg-white/30 group-hover:bg-emerald-400 group-hover:h-3 group-hover:w-lg group-hover:shadow-[0_0_16px_rgba(52,211,153,0.8)] transition-all duration-300 ease-out animate-pulse group-hover:animate-none" />
					{/* Glow effect */}
					<div className="absolute inset-0 h-1 w-96 rounded-full bg-emerald-400/20 blur-sm group-hover:h-3 group-hover:w-lg transition-all duration-300" />
				</div>
			</button>
		</div>
	);
}
