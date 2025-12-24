'use client';

import { Panel, Group, Separator } from 'react-resizable-panels';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
	className?: string;
	id?: string;
	isCollapsed?: boolean; // NEW: Track if adjacent panel is collapsed
}

/**
 * Smart ResizeHandle with 6-dot grip (2×3 grid).
 * - Hides when adjacent panel is collapsed
 * - Shows white line indicator when collapsed
 * - Centered in gap between panels
 */
function ResizeHandle({ className, id, isCollapsed = false }: ResizeHandleProps) {
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
							'absolute z-10',
							'bg-white/20',
							'aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:top-1/2',
							'aria-[orientation=vertical]:w-px aria-[orientation=vertical]:h-full aria-[orientation=vertical]:left-1/2',
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

							// Horizontal handle (for vertical split)
							'aria-[orientation=horizontal]:h-2 aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:cursor-row-resize',

							// Vertical handle (for horizontal split)
							'aria-[orientation=vertical]:w-2 aria-[orientation=vertical]:h-full aria-[orientation=vertical]:cursor-col-resize',

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

								// Horizontal handle: 2 columns × 3 rows (vertical dots)
								'aria-[orientation=horizontal]:flex-row',

								// Vertical handle: 2 columns × 3 rows (rotated)
								'aria-[orientation=vertical]:flex-col',
							)}
						>
							{/* Column 1 */}
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

							{/* Column 2 */}
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
