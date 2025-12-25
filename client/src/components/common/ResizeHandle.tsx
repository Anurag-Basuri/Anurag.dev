'use client';

import { Separator } from 'react-resizable-panels';
import { cn } from '@/lib/utils';

export { Panel, Group } from 'react-resizable-panels';

interface ResizeHandleProps {
	className?: string;
	id?: string;
	isCollapsed?: boolean;
	orientation?: 'horizontal' | 'vertical';
}

export function ResizeHandle({
	className,
	id,
	isCollapsed = false,
	orientation = 'vertical',
}: ResizeHandleProps) {
	const isHorizontal = orientation === 'horizontal';

	const gripBoxSize = isHorizontal ? 'h-4 w-12 md:h-5 md:w-14' : 'w-4 h-12 md:w-5 md:h-14';
	const dotsGrid = isHorizontal ? 'grid grid-rows-2 grid-cols-3' : 'grid grid-rows-3 grid-cols-2';

	/*
	 * Improvement: Moved all visual feedback to the grip box.
	 * The container (Separator) is now just a hit-area without visual borders/rings.
	 * This prevents the "two white lines" (focus ring) from appearing along the entire track.
	 */
	return (
		<Separator
			data-resize-handle
			id={id}
			tabIndex={0}
			role="separator"
			aria-orientation={orientation}
			aria-label={`${orientation} resize handle`}
			className={cn(
				'group relative flex items-center justify-center',
				'transition-all duration-300 ease-out', // Smoother transition

				// Hit area sizing
				isHorizontal ? 'h-3 w-full cursor-row-resize' : 'w-3 h-full cursor-col-resize',

				// Fade in/out
				isCollapsed && 'opacity-0 pointer-events-none',
				!isCollapsed && 'opacity-100',

				// No visual styles on the track itself to avoid "lines"
				'outline-none ring-0 focus:ring-0 focus:outline-none',

				className,
			)}
		>
			{/* Rounded grip box - Handles all visual feedback */}
			{!isCollapsed ? (
				<div
					className={cn(
						'pointer-events-none', // Events pass through to Separator
						'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
						'flex items-center justify-center',
						gripBoxSize,

						// Base styling - Glassmorphism
						'rounded-full', // Fully rounded for smoother look
						'border border-white/10',
						'bg-zinc-900/80 backdrop-blur-md',
						'shadow-sm',

						// Smooth transitions for all properties
						'transition-all duration-300 cubic-bezier(0.2, 0.8, 0.2, 1)',

						// Hover State
						'group-hover:scale-110',
						'group-hover:bg-zinc-800',
						'group-hover:border-white/20',
						'group-hover:shadow-[0_0_15px_rgba(0,0,0,0.3)]',

						// Active/Dragging State
						'group-active:scale-125',
						'group-active:bg-emerald-500/90', // Color pop on drag works well
						'group-active:border-emerald-500',
						'group-active:shadow-[0_0_20px_rgba(16,185,129,0.4)]', // Emerald glow
					)}
				>
					{/* Dots pattern */}
					<div className={cn(dotsGrid, 'gap-0.5')}>
						{Array.from({ length: 6 }).map((_, i) => (
							<div
								key={i}
								className={cn(
									'h-0.5 w-0.5 rounded-full',
									'bg-white/40',
									'transition-all duration-300',

									// Hover
									'group-hover:bg-white/70',
									'group-hover:scale-125',

									// Active
									'group-active:bg-white',
									'group-active:scale-150',
								)}
							/>
						))}
					</div>
				</div>
			) : (
				// Thin, always-visible strip for collapsed state (no double lines on click)
				<div
					className={cn(
						'pointer-events-none',
						'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
						isHorizontal ? 'h-[1px] w-8' : 'w-[1px] h-8',
						'rounded-full',
						'bg-border/60',

						// Smooth transitions
						'transition-colors duration-150 ease-out',
					)}
				/>
			)}
		</Separator>
	);
}
