'use client';

import {
	Group as PanelGroup,
	Panel as ResizablePanel,
	Separator as PanelResizeHandle,
} from 'react-resizable-panels';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
	direction: 'horizontal' | 'vertical';
	className?: string;
	id?: string;
}

export function ResizeHandle({ direction, className, id }: ResizeHandleProps) {
	return (
		<PanelResizeHandle
			id={id}
			className={cn(
				'relative flex items-center justify-center transition-all duration-300 group z-50',
				direction === 'horizontal'
					? 'w-1 cursor-col-resize h-full'
					: 'h-1 cursor-row-resize w-full',
				className,
			)}
		>
			{/* The visible line */}
			<div
				className={cn(
					'transition-all duration-300 bg-white/5 group-hover:bg-emerald-500/50 group-active:bg-emerald-400 group-hover:shadow-[0_0_8px_rgba(52,211,153,0.5)]',
					direction === 'horizontal'
						? 'w-px h-full group-hover:w-[2px]'
						: 'h-px w-full group-hover:h-[2px]',
				)}
			/>

			{/* Hit area expansion */}
			<div
				className={cn(
					'absolute inset-0',
					direction === 'horizontal' ? '-left-1 -right-1' : '-top-1 -bottom-1',
				)}
			/>

			{/* Center grabber icon */}
			<div
				className={cn(
					'absolute bg-white/20 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100',
					direction === 'horizontal' ? 'w-1 h-6' : 'h-1 w-6',
				)}
			/>
		</PanelResizeHandle>
	);
}

export { ResizablePanel, PanelGroup };
