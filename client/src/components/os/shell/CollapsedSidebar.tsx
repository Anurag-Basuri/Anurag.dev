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
			<div className="w-1 h-48 rounded-full bg-muted-foreground/20 group-hover:bg-primary/50 group-hover:h-64 group-hover:shadow-[0_0_12px_rgba(var(--primary),0.4)] transition-all duration-300" />
		</button>
	);
}
