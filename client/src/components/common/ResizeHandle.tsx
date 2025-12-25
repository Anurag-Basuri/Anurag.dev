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

	return (
		<Separator
			data-resize-handle
			id={id}
			tabIndex={0}
			aria-orientation={orientation}
			aria-label={`${orientation} resize handle`}
			className={cn(
				'group relative flex items-center justify-center',
				'transition-all duration-300 ease-out',

				// Hit area
				isHorizontal ? 'h-2 w-full cursor-row-resize' : 'w-2 h-full cursor-col-resize',

				// Fade
				isCollapsed && 'opacity-0 pointer-events-none',
				!isCollapsed && 'opacity-100',

				'outline-none focus:outline-none',
				className,
			)}
		>
			{/* Elegant pill grip */}
			{!isCollapsed && (
				<div
					className={cn(
						'pointer-events-none',
						'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',

						// Size based on orientation
						isHorizontal ? 'h-1 w-10' : 'w-1 h-10',

						// Base style - subtle glass
						'rounded-full',
						'bg-white/15',
						'backdrop-blur-sm',

						// Smooth transitions
						'transition-all duration-300 ease-out',

						// Hover - grow & brighten
						'group-hover:bg-white/30',
						isHorizontal
							? 'group-hover:w-16 group-hover:h-1.5'
							: 'group-hover:h-16 group-hover:w-1.5',
						'group-hover:shadow-[0_0_10px_rgba(255,255,255,0.1)]',

						// Active - emerald accent
						'group-active:bg-emerald-400/60',
						isHorizontal
							? 'group-active:w-20 group-active:h-2'
							: 'group-active:h-20 group-active:w-2',
						'group-active:shadow-[0_0_15px_rgba(52,211,153,0.3)]',
					)}
				/>
			)}
		</Separator>
	);
}
