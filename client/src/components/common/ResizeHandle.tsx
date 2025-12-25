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

	if (isCollapsed) return null;

	const gripBoxSize = isHorizontal ? 'h-4 w-10' : 'w-4 h-10';
	const dotsGrid = isHorizontal
		? 'grid grid-rows-2 grid-cols-3' // 2 horizontal lines × 3 dots
		: 'grid grid-rows-3 grid-cols-2'; // 2 vertical lines × 3 dots

	return (
		<Separator
			data-resize-handle
			id={id}
			className={cn(
				'group relative flex items-center justify-center',
				'transition-colors duration-200',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40',

				// Horizontal separator (between top/bottom panels)
				isHorizontal && 'h-2 w-full cursor-row-resize',

				// Vertical separator (between left/right panels)
				!isHorizontal && 'w-2 h-full cursor-col-resize',

				'hover:bg-muted/20',
				className,
			)}
		>
			{/* Rounded grip box */}
			<div
				className={cn(
					'pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
					'rounded-md border border-border/40 bg-card/60 backdrop-blur-sm shadow-sm',
					'flex items-center justify-center',
					gripBoxSize,
				)}
			>
				{/* 6 dots: two parallel lines of three */}
				<div className={cn(dotsGrid, 'gap-1')}>
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className={cn(
								'h-1 w-1 rounded-full transition-colors duration-200',
								'bg-foreground/35',
								'group-hover:bg-foreground/60',
								'group-active:bg-foreground/80',
							)}
						/>
					))}
				</div>
			</div>
		</Separator>
	);
}
