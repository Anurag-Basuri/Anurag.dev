import { motion } from 'framer-motion';
// ... imports

export function CollapsedSidebar({ onExpand }: CollapsedSidebarProps) {
	return (
		<div className="h-full flex items-center justify-center py-2">
			<motion.button
				onClick={onExpand}
				initial={{ opacity: 0, scaleY: 0.8 }}
				animate={{ opacity: 1, scaleY: 1 }}
				exit={{ opacity: 0, scaleY: 0.8 }}
				transition={{ duration: 0.3 }}
				className="group flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-primary/5 transition-colors duration-300"
				aria-label="Expand Sidebar"
			>
				<div className="h-96 w-1 rounded-full bg-white/20 group-hover:bg-primary/50 transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_var(--primary)]" />
			</motion.button>
		</div>
	);
}
