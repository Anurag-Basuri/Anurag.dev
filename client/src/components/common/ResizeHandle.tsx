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

	return (
		<Separator
			data-resize-handle
			id={id}
			tabIndex={0}
			aria-orientation={orientation}
			aria-label={`${orientation} resize handle`}
			className={cn(
				'group relative flex items-center justify-center',
				// Smooth transitions
				'transition-colors duration-200 ease-out',
				isHorizontal ? 'h-3 w-full cursor-row-resize' : 'w-3 h-full cursor-col-resize',
				// No background flash; let the grip/line do the talking
				!isCollapsed ? 'hover:bg-muted/12' : 'hover:bg-transparent',
				// Focus state
				'focus-visible:outline-none',
				'focus-visible:ring-2 focus-visible:ring-ring/50',
				'focus-visible:ring-offset-2 focus-visible:ring-offset-background',
				className,
			)}
		>
			{/* Grip box with 6-dot pattern */}
			{!isCollapsed ? (
				<div
					className={cn(
						'pointer-events-none',
						'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
						'flex items-center justify-center',
						gripBoxSize,
						'rounded-lg border border-border/60 bg-card/70 backdrop-blur-md shadow-sm',
						// Smooth transitions
						'transition-all duration-200 ease-out',
						// Hover state - subtle lift with glow
						'group-hover:scale-[1.05] group-hover:border-ring/50 group-hover:shadow-md group-hover:shadow-ring/15',
						// Active state - dragging feedback
						'group-active:scale-[1.08] group-active:border-primary/50 group-active:bg-primary/5 group-active:shadow-lg group-active:shadow-primary/20',
						// Focus state
						'group-focus-visible:border-ring/60 group-focus-visible:shadow-md group-focus-visible:shadow-ring/20',
					)}
				>
					{/* 6 dots: two parallel lines of three */}
					<div className={cn(dotsGrid, 'gap-1')}>
						{Array.from({ length: 6 }).map((_, i) => (
							<div
								key={i}
								className={cn(
									'h-1 w-1 rounded-full',
									'bg-foreground/45',

									// Smooth transitions
									'transition-all duration-200 ease-out',

									// Hover - dots brighten and grow
									'group-hover:bg-primary/70 group-hover:scale-110',

									// Active - stronger effect
									'group-active:bg-primary/85 group-active:scale-120',

									// Focus
									'group-focus-visible:bg-primary/70',
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
