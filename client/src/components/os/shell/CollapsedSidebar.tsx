'use client';

interface CollapsedSidebarProps {
	onExpand: () => void;
}

export function CollapsedSidebar({ onExpand }: CollapsedSidebarProps) {
	return (
		<button
			onClick={onExpand}
			className="w-full h-full flex items-center justify-center cursor-pointer group"
			aria-label="Expand Sidebar"
		>
			<div className="w-0.5 h-50 rounded-full bg-white/10 group-hover:bg-emerald-500/50 group-hover:h-24 group-hover:shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all duration-300" />
		</button>
	);
}
