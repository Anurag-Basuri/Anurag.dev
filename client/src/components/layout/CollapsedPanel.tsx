'use client';

import { motion } from 'framer-motion';
import { LucideIcon, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SPRINGS } from '@/lib/constants';

interface CollapsedPanelProps {
	type: 'sidebar' | 'terminal';
	icon: LucideIcon;
	label: string;
	orientation: 'horizontal' | 'vertical';
	onExpand: () => void;
	className?: string;
}

/**
 * Premium collapsed panel state
 * Beautiful, clickable indicator when panel is collapsed
 */
export function CollapsedPanel({
	type,
	icon: Icon,
	label,
	orientation,
	onExpand,
	className,
}: CollapsedPanelProps) {
	const isVertical = orientation === 'vertical';

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className={cn(
				'h-full w-full',
				'flex items-center justify-center',
				'cursor-pointer group',
				'relative',
				className,
			)}
			onClick={onExpand}
		>
			{/* Animated Background Line */}
			<motion.div
				className={cn(
					'rounded-full bg-white/20 group-hover:bg-emerald-400',
					'transition-all duration-300 ease-out',
					'animate-pulse group-hover:animate-none',
					'group-hover:shadow-[0_0_16px_rgba(52,211,153,0.8)]',
					isVertical
						? 'w-1 h-64 group-hover:w-3 group-hover:h-80'
						: 'h-1 w-96 group-hover:h-3 group-hover:w-full',
				)}
			/>

			{/* Glow Effect */}
			<div
				className={cn(
					'absolute inset-0 bg-emerald-400/20 blur-sm',
					'transition-all duration-300',
					'group-hover:bg-emerald-400/40',
					isVertical
						? 'w-1 h-64 group-hover:w-3 group-hover:h-80'
						: 'h-1 w-96 group-hover:h-3 group-hover:w-full',
				)}
			/>

			{/* Expandable Label */}
			<motion.div
				initial={{ scale: 0 }}
				whileHover={{ scale: 1 }}
				transition={SPRINGS.snappy}
				className="absolute flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 backdrop-blur-sm"
			>
				<Icon className="w-3.5 h-3.5" />
				<span className="text-xs font-medium tracking-wide">{label}</span>
				<ChevronRight className="w-3 h-3" />
			</motion.div>
		</motion.div>
	);
}
