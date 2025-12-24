'use client';

import { Panel, Group, Separator } from 'react-resizable-panels';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
	className?: string;
	id?: string;
}

// Premium ResizeHandle with enhanced UI/UX
function ResizeHandle({ className, id }: ResizeHandleProps) {
	return (
		<Separator
			id={id}
			className={cn(
				'group relative flex items-center justify-center z-20 backdrop-blur-sm',
				'transition-all duration-300 ease-out',

				// v4: separator exposes aria-orientation
				'aria-[orientation=vertical]:w-3 aria-[orientation=vertical]:h-full aria-[orientation=vertical]:cursor-col-resize',
				'aria-[orientation=horizontal]:h-3 aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:cursor-row-resize',

				// v4: separator exposes data-separator state (inactive|hover|drag)
				'data-[separator=inactive]:bg-white/5',
				'data-[separator=hover]:bg-emerald-500/20',
				'data-[separator=drag]:bg-emerald-500/40',

				// visuals
				'bg-linear-to-br from-transparent via-white/5 to-transparent',
				className,
			)}
		>
			<div
				className={cn(
					'absolute rounded-full transition-all duration-300 ease-out',
					'bg-linear-to-r from-transparent via-white/20 to-transparent',
					'group-hover:via-emerald-400/60 group-hover:from-emerald-500/20 group-hover:to-emerald-500/20',

					'aria-[orientation=vertical]:w-0.5 aria-[orientation=vertical]:h-16 group-hover:aria-[orientation=vertical]:h-20',
					'aria-[orientation=horizontal]:h-0.5 aria-[orientation=horizontal]:w-16 group-hover:aria-[orientation=horizontal]:w-20',
				)}
			/>
		</Separator>
	);
}

export { Panel, Group, ResizeHandle };
