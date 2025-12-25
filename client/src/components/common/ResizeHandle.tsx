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
			{/* Pill grip */}
			<div
				className={cn(
					'absolute rounded-full bg-white/20 transition-all duration-200',
					isHorizontal
						? 'h-1 w-8 group-hover:w-12 group-hover:bg-white/40 group-active:bg-emerald-400/70'
						: 'w-1 h-8 group-hover:h-12 group-hover:bg-white/40 group-active:bg-emerald-400/70',
				)}
			/>
		</Separator>
	);
}
