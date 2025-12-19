'use client';

interface CollapsedSidebarProps {
	onExpand: () => void;
}

export function CollapsedSidebar({ onExpand }: CollapsedSidebarProps) {
	return (
		<div className="h-full w-full flex items-center justify-center bg-linear-to-r from-black/10 to-transparent">
			<button
				onClick={onExpand}
				className="w-full h-full flex flex-col items-center justify-center cursor-pointer group outline-none relative"
				aria-label="Expand Sidebar"
				title="Expand Sidebar (Ctrl+B)"
			>
				{/* Vertical line that grows on hover with pulsing hint */}
				<div className="relative">
					<div className="w-1 h-64 rounded-full bg-white/30 group-hover:bg-emerald-400 group-hover:w-3 group-hover:h-80 group-hover:shadow-[0_0_16px_rgba(52,211,153,0.8)] transition-all duration-300 ease-out animate-pulse group-hover:animate-none" />
					{/* Glow effect */}
					<div className="absolute inset-0 w-1 h-64 rounded-full bg-emerald-400/20 blur-sm group-hover:w-3 group-hover:h-80 transition-all duration-300" />
				</div>
			</button>
		</div>
	);
}
