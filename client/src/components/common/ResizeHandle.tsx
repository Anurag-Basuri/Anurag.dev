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

// Minimal resize handle - always visible, thin pill that grows on interaction
export function ResizeHandle({
	className,
	id,
	isCollapsed = false,
	orientation = 'vertical',
}: ResizeHandleProps) {
	const isHorizontal = orientation === 'horizontal';

	return (
		<Separator
			id={id}
			className={cn(
				'group relative flex items-center justify-center',
				isHorizontal ? 'h-2 w-full cursor-row-resize' : 'w-2 h-full cursor-col-resize',
				'outline-none transition-opacity duration-200',
				// Slightly more visible when collapsed to indicate draggability
				isCollapsed ? 'opacity-60 hover:opacity-100' : 'opacity-100',
				className,
			)}
		>
			{/* Pill grip with glow on active */}
			<div
				className={cn(
					'absolute rounded-full transition-all duration-200',
					// Background color - more visible when collapsed
					isCollapsed
						? 'bg-primary/40 group-hover:bg-primary/60'
						: 'bg-muted-foreground/30 group-hover:bg-muted-foreground/50',
					// Glow effect on active
					'group-active:bg-primary group-active:shadow-[0_0_12px_var(--primary)]',
					// Size and hover state
					isHorizontal
						? 'h-1 w-10 group-hover:w-16 group-active:h-1.5'
						: 'w-1 h-10 group-hover:h-16 group-active:w-1.5',
				)}
			/>
		</Separator>
	);
}
