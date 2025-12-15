'use client';

import { motion } from 'framer-motion';
import { PanelLeftOpen } from 'lucide-react';

interface CollapsedSidebarProps {
	onExpand: () => void;
}

export function CollapsedSidebar({ onExpand }: CollapsedSidebarProps) {
	return (
		<motion.button
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			onClick={onExpand}
			className="w-full h-full flex flex-col items-center justify-center cursor-pointer group relative overflow-hidden bg-gradient-to-b from-sidebar/30 to-sidebar/50 hover:from-sidebar/40 hover:to-sidebar/60 transition-all duration-300"
			aria-label="Expand Sidebar"
			title="Click to expand sidebar (Ctrl+B)"
		>
			{/* Animated glow effect */}
			<motion.div
				className="absolute inset-0 bg-gradient-to-b from-emerald-500/0 via-emerald-500/5 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
				aria-hidden="true"
			/>

			{/* Vertical line indicator */}
			<motion.div
				className="w-0.5 h-50 rounded-full bg-gradient-to-b from-transparent via-white/20 to-transparent group-hover:h-80 group-hover:via-emerald-400/60 group-hover:shadow-[0_0_12px_rgba(52,211,153,0.4)] transition-all duration-300"
				whileHover={{ scaleY: 1.2 }}
				aria-hidden="true"
			/>

			{/* Icon hint */}
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.3 }}
				className="mt-4 p-2 rounded-lg bg-white/5 group-hover:bg-white/10 border border-white/10 group-hover:border-emerald-400/30 transition-all duration-300"
				whileHover={{ scale: 1.1 }}
			>
				<PanelLeftOpen
					className="w-4 h-4 text-white/40 group-hover:text-emerald-400 transition-colors duration-300"
					aria-hidden="true"
				/>
			</motion.div>

			{/* Text hint */}
			<motion.span
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: 0.5 }}
				className="mt-3 text-[10px] font-medium text-white/30 group-hover:text-emerald-400/80 uppercase tracking-wider transition-colors duration-300"
			>
				Expand
			</motion.span>
		</motion.button>
	);
}
