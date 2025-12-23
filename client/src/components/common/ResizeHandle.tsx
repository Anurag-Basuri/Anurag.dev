'use client';

import { Group, Panel, Separator } from 'react-resizable-panels';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
	className?: string;
	id?: string;
}

function ResizeHandle({ className, id }: ResizeHandleProps) {
	return (
		<Separator
			id={id}
			className={cn(
				'group relative flex items-center justify-center',
				'data-[resize-handle-state="drag"]:bg-emerald-500/50',
				'data-[resize-handle-state="hover"]:bg-emerald-500/30',
				'data-[resize-handle-state="inactive"]:bg-white/5',
				'data-[panel-group-direction=vertical]:h-1',
				'data-[panel-group-direction=vertical]:cursor-row-resize',
				'data-[panel-group-direction=horizontal]:w-1',
				'data-[panel-group-direction=horizontal]:cursor-col-resize',
				'transition-all duration-300',
				'hover:shadow-[0_0_8px_rgba(52,211,153,0.5)]',
				'z-50',
				className,
			)}
		/>
	);
}

export { Panel, Group, ResizeHandle };
