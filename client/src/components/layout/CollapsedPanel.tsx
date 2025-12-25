'use client';

import { motion } from 'framer-motion';
import { LucideIcon, ChevronRight, ChevronUp } from 'lucide-react';
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
 * Industry-grade collapsed panel indicator
 * Elegant, minimal design with smooth hover animations
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
			transition={{ duration: 0.25, ease: 'easeOut' }}
			onClick={onExpand}
			className={cn(
				'h-full w-full',
				'cursor-pointer group',
				'relative overflow-hidden',
				// Glass morphism base
				'bg-gradient-to-br from-zinc-900/90 to-zinc-950/95',
				'backdrop-blur-xl',
				className,
			)}
		>
			{/* Subtle animated gradient border */}
			<div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
				<div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-500/5" />
			</div>

			{/* Sidebar collapsed - vertical strip */}
			{isVertical && (
				<div className="h-full flex flex-col items-center justify-center py-6 relative z-10">
					{/* Icon with glow effect */}
					<motion.div
						className={cn(
							'relative p-2.5 rounded-xl mb-4',
							'bg-white/[0.03] border border-white/[0.06]',
							'transition-all duration-300 ease-out',
							'group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20',
							'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
						)}
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
					>
						<Icon
							className={cn(
								'w-4 h-4',
								'text-white/40 transition-colors duration-300',
								'group-hover:text-emerald-400',
							)}
						/>

						{/* Pulse ring on hover */}
						<div
							className={cn(
								'absolute inset-0 rounded-xl',
								'border border-emerald-500/0 group-hover:border-emerald-500/30',
								'transition-all duration-300',
								'group-hover:scale-125 group-hover:opacity-0',
							)}
						/>
					</motion.div>

					{/* Vertical label */}
					<div
						className="flex-1 flex items-center justify-center"
						style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
					>
						<span
							className={cn(
								'text-[10px] font-semibold tracking-[0.2em] uppercase',
								'text-white/25 transition-all duration-300',
								'group-hover:text-emerald-400/70',
								'group-hover:tracking-[0.25em]',
							)}
						>
							{label}
						</span>
					</div>

					{/* Expand indicator */}
					<motion.div
						className="mt-4"
						animate={{ x: [0, 3, 0] }}
						transition={{
							duration: 1.5,
							repeat: Infinity,
							ease: 'easeInOut',
						}}
					>
						<ChevronRight
							className={cn(
								'w-3.5 h-3.5',
								'text-white/20 transition-colors duration-300',
								'group-hover:text-emerald-400',
							)}
						/>
					</motion.div>
				</div>
			)}

			{/* Terminal collapsed - horizontal strip */}
			{isHorizontal && (
				<div className="h-full flex items-center justify-center gap-3 px-4 relative z-10">
					{/* Icon with glow */}
					<motion.div
						className={cn(
							'relative p-2 rounded-lg',
							'bg-white/[0.03] border border-white/[0.06]',
							'transition-all duration-300 ease-out',
							'group-hover:bg-emerald-500/10 group-hover:border-emerald-500/20',
							'group-hover:shadow-[0_0_20px_rgba(16,185,129,0.15)]',
						)}
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.95 }}
					>
						<Icon
							className={cn(
								'w-3.5 h-3.5',
								'text-white/40 transition-colors duration-300',
								'group-hover:text-emerald-400',
							)}
						/>
					</motion.div>

					{/* Label */}
					<span
						className={cn(
							'text-xs font-semibold tracking-wide',
							'text-white/25 transition-all duration-300',
							'group-hover:text-emerald-400/70',
							'group-hover:tracking-wider',
						)}
					>
						{label}
					</span>

					{/* Expand indicator */}
					<motion.div
						animate={{ y: [0, -2, 0] }}
						transition={{
							duration: 1.5,
							repeat: Infinity,
							ease: 'easeInOut',
						}}
					>
						<ChevronUp
							className={cn(
								'w-3.5 h-3.5',
								'text-white/20 transition-colors duration-300',
								'group-hover:text-emerald-400',
							)}
						/>
					</motion.div>
				</div>
			)}

			{/* Bottom/Right edge glow line */}
			<div
				className={cn(
					'absolute transition-all duration-500',
					isVertical ? 'right-0 top-0 h-full w-px' : 'bottom-0 left-0 w-full h-px',
					'bg-gradient-to-b from-transparent via-white/10 to-transparent',
					'group-hover:via-emerald-500/40',
				)}
			/>
		</motion.div>
	);
}
