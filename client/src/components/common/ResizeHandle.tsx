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

/**
 * Minimal resize handle - thin pill that grows on interaction
 */
export function ResizeHandle({
	className,
	id,
	isCollapsed = false,
	orientation = 'vertical',
}: ResizeHandleProps) {
	const isHorizontal = orientation === 'horizontal';

	if (isCollapsed) return null;

	return (
		<Separator
			id={id}
			className={cn(
				'group relative flex items-center justify-center',
				isHorizontal ? 'h-2 w-full cursor-row-resize' : 'w-2 h-full cursor-col-resize',
				'outline-none',
				className,
			)}
		>
			{/* Pill grip with glow on active */}
			<div
				className={cn(
					'absolute rounded-full bg-white/20 transition-all duration-200',
					// Glow effect on active
					'group-active:shadow-[0_0_12px_rgba(52,211,153,0.5)]',
					isHorizontal
						? 'h-1 w-10 group-hover:w-14 group-hover:bg-white/40 group-active:bg-emerald-400/80 group-active:h-1.5'
						: 'w-1 h-10 group-hover:h-14 group-hover:bg-white/40 group-active:bg-emerald-400/80 group-active:w-1.5',
				)}
			/>
		</Separator>
	);
}
