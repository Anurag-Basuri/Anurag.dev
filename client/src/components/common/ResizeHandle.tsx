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

	// Thinner, more elegant grip dimensions
	const gripSize = isHorizontal ? 'h-1 w-8' : 'w-1 h-8';

	return (
		<Separator
			data-resize-handle
			id={id}
			tabIndex={0}
			aria-orientation={orientation}
			aria-label={`${orientation} resize handle`}
			className={cn(
				'group relative flex items-center justify-center',
				'transition-opacity duration-300 ease-out',

				// Hit area - generous for easy grabbing
				isHorizontal ? 'h-2 w-full cursor-row-resize' : 'w-2 h-full cursor-col-resize',

				// Fade in/out
				isCollapsed && 'opacity-0 pointer-events-none',
				!isCollapsed && 'opacity-100',

				// No visual artifacts
				'outline-none focus:outline-none',

				className,
			)}
		>
			{/* Minimal pill-shaped grip */}
			{!isCollapsed && (
				<div
					className={cn(
						'pointer-events-none',
						'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
						gripSize,

						// Sleek pill shape
						'rounded-full',
						'bg-white/20',

						// Buttery smooth transition
						'transition-all duration-300 ease-in-out',

						// Hover - subtle grow + brighten
						'group-hover:bg-white/40',
						isHorizontal
							? 'group-hover:w-12 group-hover:h-1.5'
							: 'group-hover:h-12 group-hover:w-1.5',

						// Active - emerald accent
						'group-active:bg-emerald-400/80',
						isHorizontal
							? 'group-active:w-16 group-active:h-1.5'
							: 'group-active:h-16 group-active:w-1.5',
					)}
				/>
			)}
		</Separator>
	);
}
