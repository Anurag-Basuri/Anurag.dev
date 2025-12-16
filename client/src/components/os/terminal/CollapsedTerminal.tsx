'use client';

// Same minimal design as CollapsedSidebar but horizontal
interface CollapsedTerminalProps {
	onExpand: () => void;
}

export function CollapsedTerminal({ onExpand }: CollapsedTerminalProps) {
	return (
		<div className="h-full w-full flex items-center justify-center bg-sidebar/50">
			<button
				onClick={onExpand}
				className="w-full h-full flex items-center justify-center cursor-pointer group outline-none"
				aria-label="Expand Terminal"
				title="Expand Terminal (Ctrl+J)"
			>
				{/* Horizontal line that grows on hover */}
				<div className="h-0.5 w-16 rounded-full bg-white/50 group-hover:bg-emerald-400 group-hover:w-24 group-hover:shadow-[0_0_12px_rgba(52,211,153,0.6)] transition-all duration-300 ease-out" />
			</button>
		</div>
	);
}
