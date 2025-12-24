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
				// Horizontal group = Vertical Handle (Left/Right)
				'data-[panel-group-direction=horizontal]:w-4 data-[panel-group-direction=horizontal]:h-full data-[panel-group-direction=horizontal]:cursor-col-resize',
				// Vertical group = Horizontal Handle (Top/Bottom)
				'data-[panel-group-direction=vertical]:h-4 data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:cursor-row-resize',

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
					// Horizontal Direction -> Vertical Handle
					'data-[panel-group-direction=horizontal]:w-1.5 data-[panel-group-direction=horizontal]:h-8',
					// Vertical Direction -> Horizontal Handle
					'data-[panel-group-direction=vertical]:h-1.5 data-[panel-group-direction=vertical]:w-8',
					// Shadow for depth
					'shadow-sm',
				)}
			>
				<div
					className={cn(
						'flex gap-0.5',
						// Rotate for orientation
						// Horizontal group (Vertical handle) -> Flex col
						'data-[panel-group-direction=horizontal]:flex-col',
						'data-[panel-group-direction=vertical]:flex-row',
					)}
				>
					{/* 6 dots grid */}
					<div
						className={cn(
							'grid gap-0.5 p-px',
							// Horizontal group (Vertical handle) -> 2 cols x 3 rows
							'data-[panel-group-direction=horizontal]:grid-cols-2 data-[panel-group-direction=horizontal]:grid-rows-3',
							// Vertical group (Horizontal handle) -> 3 cols x 2 rows
							'data-[panel-group-direction=vertical]:grid-rows-2 data-[panel-group-direction=vertical]:grid-cols-3',
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
							'data-[panel-group-direction=horizontal]:left-6',
							'data-[panel-group-direction=vertical]:top-6',
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
