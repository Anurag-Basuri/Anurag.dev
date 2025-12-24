'use client';

import { Panel, Group, Separator } from 'react-resizable-panels';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
	className?: string;
	id?: string;
}

// Custom ResizeHandle component for react-resizable-panels
function ResizeHandle({ className, id }: ResizeHandleProps) {
	return (
		<Separator
			id={id}
			className={cn(
				'relative bg-white/5 hover:bg-emerald-500/30 active:bg-emerald-500/50',
				'transition-colors duration-200',
				'data-[panel-group-direction=vertical]:h-1 data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:cursor-row-resize',
				'data-[panel-group-direction=horizontal]:w-1 data-[panel-group-direction=horizontal]:h-full data-[panel-group-direction=horizontal]:cursor-col-resize',
				'hover:shadow-[0_0_8px_rgba(52,211,153,0.5)]',
				'z-10',
				className,
			)}
		/>
	);
}

export { Panel, Group, ResizeHandle };
