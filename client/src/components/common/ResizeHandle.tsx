'use client';

import { Panel, Group, Separator } from 'react-resizable-panels';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
	className?: string;
	id?: string;
	isCollapsed?: boolean;
	orientation?: 'horizontal' | 'vertical';
}

/**
 * Smart ResizeHandle with 6-dot grip (2×3 grid).
 * - Hides when adjacent panel is collapsed
 * - Shows white line indicator when collapsed
 * - Centered in gap between panels
 * - Adapts to horizontal/vertical orientation
 */
function ResizeHandle({
	className,
	id,
	isCollapsed = false,
	orientation = 'vertical', // Default to vertical (for horizontal split)
}: ResizeHandleProps) {
	const isHorizontal = orientation === 'horizontal';

	return (
		<>
			{/* Collapsed indicator: subtle white line */}
			<AnimatePresence>
				{isCollapsed && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className={cn(
							'absolute z-10 bg-white/20',
							isHorizontal
								? 'h-px w-full top-1/2 -translate-y-1/2'
								: 'w-px h-full left-1/2 -translate-x-1/2',
						)}
					/>
				)}
			</AnimatePresence>

			{/* Resize handle: only visible when NOT collapsed */}
			<AnimatePresence>
				{!isCollapsed && (
					<Separator
						id={id}
						className={cn(
							'group relative flex items-center justify-center',
							'transition-colors duration-200',

							// Horizontal handle (for vertical split - top/bottom panels)
							isHorizontal && 'h-2 w-full cursor-row-resize',

							// Vertical handle (for horizontal split - left/right panels)
							!isHorizontal && 'w-2 h-full cursor-col-resize',

							// Hover state
							'hover:bg-emerald-500/5',

							className,
						)}
					>
						{/* 6-dot grip pattern: 2 columns × 3 rows */}
						<motion.div
							initial={{ opacity: 0.5, scale: 1 }}
							whileHover={{ opacity: 1, scale: 1.05 }}
							transition={{ duration: 0.2 }}
							className={cn(
								'absolute flex gap-1',

								// Horizontal handle: dots arranged horizontally (2 rows × 3 cols)
								isHorizontal && 'flex-row',

								// Vertical handle: dots arranged vertically (2 cols × 3 rows)
								!isHorizontal && 'flex-col',
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
					</Separator>
				)}
			</AnimatePresence>
		</>
	);
}

export { Panel, Group, ResizeHandle };
