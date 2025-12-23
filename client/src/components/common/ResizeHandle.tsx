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
				'group relative flex items-center justify-center z-50 transition-all duration-300',
				'data-[separator=drag]:bg-emerald-500/50',
				'data-[separator=hover]:bg-emerald-500/30',
				'data-[separator=inactive]:bg-white/5',
				'aria-[orientation=vertical]:h-1 aria-[orientation=vertical]:w-full aria-[orientation=vertical]:cursor-row-resize',
				'aria-[orientation=horizontal]:w-1 aria-[orientation=horizontal]:h-full aria-[orientation=horizontal]:cursor-col-resize',
				'hover:shadow-[0_0_8px_rgba(52,211,153,0.5)]',
				className,
			)}
		/>
	);
}

export { Panel, Group, ResizeHandle };
