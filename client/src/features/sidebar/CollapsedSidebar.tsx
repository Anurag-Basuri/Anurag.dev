'use client';

interface CollapsedSidebarProps {
	onExpand: () => void;
}

export function CollapsedSidebar({ onExpand }: CollapsedSidebarProps) {
	return (
		<div className="h-full w-full flex items-center justify-center">
			<button
				onClick={onExpand}
				className="w-full h-full flex flex-col items-center justify-center cursor-pointer group outline-none"
				aria-label="Expand Sidebar"
				title="Expand Sidebar (Ctrl+B)"
			>
				{/* Vertical line that grows on hover */}
				<div className="w-0.75 h-50 rounded-full bg-white/50 group-hover:bg-emerald-400 group-hover:h-70 group-hover:shadow-[0_0_12px_rgba(52,211,153,0.6)] transition-all duration-300 ease-out" />
			</button>
		</div>
	);
}
