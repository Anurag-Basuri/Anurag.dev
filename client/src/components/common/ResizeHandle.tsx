'use client';

import { Panel, Group, Separator } from 'react-resizable-panels';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { PANEL_DESIGN } from '@/lib/constants';

interface ResizeHandleProps {
	className?: string;
	id?: string;
	onDoubleClick?: () => void;
}

// Industry-standard 6-dot grip ResizeHandle
function ResizeHandle({ className, id, onDoubleClick }: ResizeHandleProps) {
	const [isHovered, setIsHovered] = useState(false);
	const [isDragging, setIsDragging] = useState(false);
	const [showTooltip, setShowTooltip] = useState(false);

	// Show tooltip after brief hover, but only if not dragging
	useEffect(() => {
		if (isHovered && !isDragging) {
			const timer = setTimeout(() => setShowTooltip(true), 800);
			return () => clearTimeout(timer);
		} else {
			setShowTooltip(false);
		}
	}, [isHovered, isDragging]);

	return (
		<Separator
			id={id}
			onDoubleClick={onDoubleClick}
			onMouseEnter={() => setIsHovered(true)}
			onMouseLeave={() => setIsHovered(false)}
			onMouseDown={() => setIsDragging(true)}
			onMouseUp={() => setIsDragging(false)}
			className={cn(
				'group relative flex items-center justify-center z-20 outline-none',
				'transition-all duration-200',

				// Hit area sizing
				'aria-[orientation=vertical]:w-4 aria-[orientation=vertical]:h-full aria-[orientation=vertical]:cursor-col-resize',
				'aria-[orientation=horizontal]:h-4 aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:cursor-row-resize',

				// Visual feedback on the transparent separator track
				'bg-transparent',

				className,
			)}
		>
			{/* The Visible Handle (The Pill) */}
			<motion.div
				animate={{
					backgroundColor: isDragging
						? 'var(--primary)'
						: isHovered
						? 'var(--muted-foreground)'
						: 'var(--border)',
					scale: isDragging ? 1.05 : 1,
				}}
				transition={{ duration: 0.15 }}
				className={cn(
					'relative flex items-center justify-center rounded-xs backdrop-blur-sm',
					// Shape & Size
					'aria-[orientation=vertical]:w-1.5 aria-[orientation=vertical]:h-8',
					'aria-[orientation=horizontal]:h-1.5 aria-[orientation=horizontal]:w-8',
					// Shadow for depth
					'shadow-sm',
				)}
			>
				{/* 6-Dots Grip Pattern */}
				{/* We use a pseudo-element or just simple dots. Actual dots give more control. */}
				<div
					className={cn(
						'grid gap-0.5 pointer-events-none opacity-80',
						// Grid layout based on orientation
						'aria-[orientation=vertical]:grid-cols-1 aria-[orientation=vertical]:grid-rows-3', // 3 stacked dots for vertical line look, or 2x3 for grip?
						// User asked for "rectangle with six dot". Usually 2x3.
						// Let's check orientation. If layout is vertical (separating left/right), handle is vertical.

						// Vertical Handle (separates horizontal content): | |
						'aria-[orientation=vertical]:grid-cols-1 gap-y-1', // Actually, simplest "grip" is often just a line or 3 dots.
						// Requirements: "rectangle with six dot".
						// Let's do 2 columns x 3 rows for vertical handle logic? No, vertical handle is thin.
						// Usually vertical splitter has dots arranged vertically.
						// 2 columns would be wide.

						// Let's try flexible flex layout for "dots"
					)}
				>
					{/* 
                      Implementing strict "6 dots" design.
                      Vertical Handle (Separates Left/Right): Needs to constitute a "vertical grip".
                      Usually that's 2 columns of 3 dots if it's a "pad", or 1 column of 6 dots (too long).
                      Let's stick to a clean standardized look:
                      Vertical: 1 column of 3 elongated dashes OR 2 columns of 3 small dots.
                      Given "w-4" (16px) hit area, and "w-1.5" (6px) visible handle... 2 columns is tight.
                      Let's make the visible handle slightly wider to accommodate 2 cols if needed, 
                      OR just standard 3-dot vertical ellipsis which is cleaner.
                      
                      Re-reading request: "rectangle with six dot in them and small".
                      Okay, making the visible handle a "small rectangle".
                      
                      Vertical Handle:
                      [ . . ]
                      [ . . ]
                      [ . . ]
                    */}
				</div>

				{/* 
                   Let's use absolute positioning for the dots based on parent orientation
                   to avoid complex grid logical conditional classes.
                */}

				<div
					className={cn(
						'flex gap-0.5',
						// Rotate for orientation
						'aria-[orientation=vertical]:flex-col',
						'aria-[orientation=horizontal]:flex-row',
					)}
				>
					{/* We will create 2 "lines" of 3 dots each? Or just one group of 6? */}
					{/* Let's try 6 dots in a grid. */}
					<div
						className={cn(
							'grid gap-0.5 p-px',
							'aria-[orientation=vertical]:grid-cols-2 aria-[orientation=vertical]:grid-rows-3',
							'aria-[orientation=horizontal]:grid-rows-2 aria-[orientation=horizontal]:grid-cols-3',
						)}
					>
						{[...Array(6)].map((_, i) => (
							<div
								key={i}
								className={cn(
									'w-0.5 h-0.5 rounded-full',
									isDragging ? 'bg-primary-foreground' : 'bg-background',
								)}
							/>
						))}
					</div>
				</div>
			</motion.div>

			{/* Tooltip */}
			<AnimatePresence>
				{showTooltip && (
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.9 }}
						transition={{ duration: 0.1 }}
						className={cn(
							'absolute z-50 px-2 py-1 rounded bg-popover text-popover-foreground text-[10px] font-medium shadow-md border',
							// Position
							'aria-[orientation=vertical]:left-6',
							'aria-[orientation=horizontal]:top-6',
						)}
					>
						Double-click to reset
					</motion.div>
				)}
			</AnimatePresence>
		</Separator>
	);
}

export { Panel, Group, ResizeHandle };
