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
			{/* 6-dot grip pattern: 2 columns × 3 rows (matches user's reference) */}
			<motion.div
				animate={{
					opacity: isHovered ? 1 : 0.5,
					scale: isHovered ? 1.05 : 1,
				}}
				transition={{ duration: 0.2 }}
				className={cn(
					'absolute flex gap-1',

					// Horizontal handle: 2 columns × 3 rows (vertical dots)
					'aria-[orientation=horizontal]:flex-row',

					// Vertical handle: 3 rows × 2 columns (horizontal dots, rotated 90°)
					'aria-[orientation=vertical]:flex-col',
				)}
			>
				{/* Column/Row 1 */}
				<div className="flex flex-col gap-1">
					{[0, 1, 2].map(i => (
						<div
							key={`col1-${i}`}
							className={cn(
								'rounded-full transition-colors duration-200',
								'w-1 h-1',
								'bg-foreground/40',
								'group-hover:bg-emerald-400/70',
								'group-active:bg-emerald-300',
							)}
						/>
					))}
				</div>

				{/* Column/Row 2 */}
				<div className="flex flex-col gap-1">
					{[0, 1, 2].map(i => (
						<div
							key={`col2-${i}`}
							className={cn(
								'rounded-full transition-colors duration-200',
								'w-1 h-1',
								'bg-foreground/40',
								'group-hover:bg-emerald-400/70',
								'group-active:bg-emerald-300',
							)}
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
