'use client';

import { Panel, Group, Separator } from 'react-resizable-panels';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
	className?: string;
	id?: string;
	onDoubleClick?: () => void;
}

/**
 * Industry-grade ResizeHandle with rectangular 6-dot grip pattern.
 * Smaller, more subtle design that adapts to orientation.
 */
function ResizeHandle({ className, id, onDoubleClick }: ResizeHandleProps) {
	const [isHovered, setIsHovered] = useState(false);

	return (
		<Separator
			id={id}
			onDoubleClick={onDoubleClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			className={cn(
				'group relative flex items-center justify-center z-20',
				'transition-colors duration-200',

				// Horizontal handle (for vertical split)
				'aria-[orientation=horizontal]:h-2 aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:cursor-row-resize',
				'aria-[orientation=horizontal]:hover:h-3',

				// Vertical handle (for horizontal split)
				'aria-[orientation=vertical]:w-2 aria-[orientation=vertical]:h-full aria-[orientation=vertical]:cursor-col-resize',
				'aria-[orientation=vertical]:hover:w-3',

				// State-based background
				'bg-transparent hover:bg-emerald-500/5 active:bg-emerald-500/10',

				className,
			)}
		>
			{/* Rectangular grip with 6 dots (2x3 grid) */}
			<motion.div
				animate={{
					opacity: isHovered ? 1 : 0.4,
					scale: isHovered ? 1.1 : 1,
				}}
				transition={{ duration: 0.15 }}
				className={cn(
					'absolute rounded-md',
					'bg-linear-to-br from-border/60 to-border/40',
					'backdrop-blur-sm',
					'flex items-center justify-center',
					'shadow-sm',

					// Horizontal orientation: wide rectangle
					'aria-[orientation=horizontal]:w-12 aria-[orientation=horizontal]:h-1',
					'aria-[orientation=horizontal]:flex-row aria-[orientation=horizontal]:gap-1.5',

					// Vertical orientation: tall rectangle
					'aria-[orientation=vertical]:w-1 aria-[orientation=vertical]:h-12',
					'aria-[orientation=vertical]:flex-col aria-[orientation=vertical]:gap-1.5',
				)}
			>
				{/* 6 dots in 2x3 grid pattern */}
				<div
					className={cn(
						'flex gap-0.5',
						'aria-[orientation=horizontal]:flex-col',
						'aria-[orientation=vertical]:flex-row',
					)}
				>
					{/* Column/Row 1 */}
					{[0, 1, 2].map(i => (
						<div
							key={`a-${i}`}
							className="w-0.5 h-0.5 rounded-full bg-foreground/30 group-hover:bg-emerald-400/60"
						/>
					))}
				</div>
				<div
					className={cn(
						'flex gap-0.5',
						'aria-[orientation=horizontal]:flex-col',
						'aria-[orientation=vertical]:flex-row',
					)}
				>
					{/* Column/Row 2 */}
					{[0, 1, 2].map(i => (
						<div
							key={`b-${i}`}
							className="w-0.5 h-0.5 rounded-full bg-foreground/30 group-hover:bg-emerald-400/60"
						/>
					))}
				</div>
			</motion.div>

			{/* Subtle hit area indicator on hover */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: isHovered ? 0.3 : 0 }}
				className={cn(
					'absolute pointer-events-none',
					'bg-linear-to-r from-transparent via-emerald-500/20 to-transparent',
					'aria-[orientation=horizontal]:h-full aria-[orientation=horizontal]:w-24',
					'aria-[orientation=vertical]:w-full aria-[orientation=vertical]:h-24',
				)}
			/>
		</Separator>
	);
}

export { Panel, Group, ResizeHandle };
