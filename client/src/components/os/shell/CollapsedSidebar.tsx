'use client';

interface CollapsedSidebarProps {
	onExpand: () => void;
}

export function CollapsedSidebar({ onExpand }: CollapsedSidebarProps) {
	return (
		<div className="h-full flex items-center justify-center">
			<button
				onClick={onExpand}
				className="group flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-primary/5 transition-colors duration-200"
				aria-label="Expand Sidebar"
			>
				<div className="h-48 w-1 rounded-full bg-white/20 group-hover:bg-primary/50 transition-all duration-200 shadow-[0_0_8px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_16px_var(--primary)]" />
			</button>
		</div>
	);
}
