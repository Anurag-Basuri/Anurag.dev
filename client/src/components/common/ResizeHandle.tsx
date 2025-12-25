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

	const gripBoxSize = isHorizontal ? 'h-3 w-8 md:h-4 md:w-10' : 'w-3 h-8 md:w-4 md:h-10';

	const dotsGrid = isHorizontal
		? 'grid grid-rows-2 grid-cols-3' // 2 horizontal lines × 3 dots
		: 'grid grid-rows-3 grid-cols-2'; // 2 vertical lines × 3 dots

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

				// Smooth transitions
				'transition-all duration-200 ease-out',

				// Fade in/out
				isCollapsed && 'opacity-0 pointer-events-none',
				!isCollapsed && 'opacity-100',

				// Horizontal separator (between top/bottom panels)
				isHorizontal && 'h-2 w-full cursor-row-resize',

				// Vertical separator (between left/right panels)
				!isHorizontal && 'w-2 h-full cursor-col-resize',

				// Hover state
				'hover:bg-muted/20',

				// Focus state
				'focus-visible:outline-none',
				'focus-visible:ring-2 focus-visible:ring-emerald-500/50',
				'focus-visible:ring-offset-2 focus-visible:ring-offset-background',

				className,
			)}
		>
			{/* Rounded grip box */}
			<div
				className={cn(
					'pointer-events-none',
					'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
					'flex items-center justify-center',
					gripBoxSize,

					// Base styling
					'rounded-lg border bg-card/70 backdrop-blur-md shadow-sm',
					'border-border/50',

					// Smooth transitions
					'transition-all duration-200 ease-out',

					// Hover state - subtle lift with glow
					'group-hover:scale-[1.08]',
					'group-hover:bg-card/90',
					'group-hover:border-emerald-500/40',
					'group-hover:shadow-md group-hover:shadow-emerald-500/10',

					// Active state - dragging feedback
					'group-active:scale-110',
					'group-active:border-emerald-500/60',
					'group-active:bg-emerald-500/5',
					'group-active:shadow-lg group-active:shadow-emerald-500/20',

					// Focus state
					'group-focus-visible:border-emerald-500/50',
					'group-focus-visible:shadow-md group-focus-visible:shadow-emerald-500/15',
				)}
			>
				{/* 6 dots: two parallel lines of three */}
				<div className={cn(dotsGrid, 'gap-1')}>
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className={cn(
								'h-1 w-1 rounded-full',
								'bg-foreground/35',

								// Smooth transitions
								'transition-all duration-200 ease-out',

								// Hover - dots brighten and grow
								'group-hover:bg-emerald-400/60',
								'group-hover:scale-110',

								// Active - stronger effect
								'group-active:bg-emerald-300/80',
								'group-active:scale-125',

								// Focus
								'group-focus-visible:bg-emerald-400/50',
							)}
						/>
					))}
				</div>
			</div>
		</Separator>
	);
}
