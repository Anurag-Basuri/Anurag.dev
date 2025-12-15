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
			title="Click to expand sidebar"
		>
			<div className="w-0.5 h-50 rounded-full group-hover:h-80 group-hover:shadow-[0_0_12px_rgba(var(--primary),0.4)] transition-all bg-white" />
		</button>
	);
}
