'use client';

interface CollapsedSidebarProps {
	onExpand: () => void;
}

export function CollapsedSidebar({ onExpand }: CollapsedSidebarProps) {
	return (
		<div className="h-full flex items-center justify-center">
			<button
				onClick={onExpand}
				className="flex items-center justify-center w-full h-full cursor-pointer hover:bg-white/2 transition-colors"
				aria-label="Expand Sidebar"
			>
				<span className="text-white/20 hover:text-white/40 text-lg tracking-[0.3em] transition-colors rotate-90">
					•••
				</span>
			</button>
		</div>
	);
}
