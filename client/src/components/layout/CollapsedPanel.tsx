'use client';

import { motion } from 'framer-motion';
import { LucideIcon, ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsedPanelProps {
	type: 'sidebar' | 'terminal';
	icon: LucideIcon;
	label: string;
	orientation: 'horizontal' | 'vertical';
	onExpand: () => void;
	className?: string;
}

/**
 * Minimal collapsed panel indicator
 * Shows a thin clickable bar with icon when panel is collapsed
 */
export function CollapsedPanel({
	type,
	icon: Icon,
	label,
	orientation,
	onExpand,
	className,
}: CollapsedPanelProps) {
	const isVertical = orientation === 'vertical'; // Sidebar
	const isHorizontal = orientation === 'horizontal'; // Terminal

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2 }}
			onClick={onExpand}
			className={cn(
				'h-full w-full',
				'flex items-center justify-center',
				'cursor-pointer group',
				'bg-zinc-900/60 backdrop-blur-sm',
				'transition-colors duration-200',
				'hover:bg-zinc-800/80',
				className,
			)}
		>
			{/* Sidebar collapsed - vertical strip on left */}
			{isVertical && (
				<div className="flex flex-col items-center gap-3 py-4">
					{/* Icon */}
					<div
						className={cn(
							'p-2 rounded-lg',
							'bg-white/5 border border-white/10',
							'transition-all duration-200',
							'group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30',
						)}
					>
						<Icon className="w-4 h-4 text-white/60 group-hover:text-emerald-400 transition-colors" />
					</div>

					{/* Vertical text */}
					<span
						className={cn(
							'text-[10px] font-medium tracking-widest text-white/40',
							'writing-mode-vertical',
							'group-hover:text-emerald-400/80 transition-colors',
						)}
						style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
					>
						{label.toUpperCase()}
					</span>

					{/* Expand arrow */}
					<ChevronRight className="w-3 h-3 text-white/30 group-hover:text-emerald-400 transition-colors" />
				</div>
			)}

			{/* Terminal collapsed - horizontal strip on bottom */}
			{isHorizontal && (
				<div className="flex items-center gap-2 px-4">
					{/* Icon */}
					<div
						className={cn(
							'p-1.5 rounded-md',
							'bg-white/5 border border-white/10',
							'transition-all duration-200',
							'group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30',
						)}
					>
						<Icon className="w-3.5 h-3.5 text-white/60 group-hover:text-emerald-400 transition-colors" />
					</div>

					{/* Label */}
					<span className="text-xs font-medium text-white/40 group-hover:text-emerald-400/80 transition-colors">
						{label}
					</span>

					{/* Expand arrow */}
					<ChevronDown className="w-3 h-3 text-white/30 group-hover:text-emerald-400 transition-colors rotate-180" />
				</div>
			)}
		</motion.div>
	);
}
