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
		<	Separator
			id={id}
			className={cn(
				// Base styles - larger hit area for easier grabbing
				'group relative flex items-center justify-center',
				'transition-all duration-200 ease-out',

				// Direction-based sizing
				'data-[panel-group-direction=vertical]:h-2 data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:cursor-row-resize',
				'data-[panel-group-direction=horizontal]:w-2 data-[panel-group-direction=horizontal]:h-full data-[panel-group-direction=horizontal]:cursor-col-resize',

				// State-based background colors
				'bg-transparent',
				'hover:bg-emerald-500/10',
				'active:bg-emerald-500/20',

				// Layering
				'z-20',

				className,
			)}
		>
			{/* Visual grip indicator */}
			<div
				className={cn(
					'absolute rounded-full transition-all duration-300 ease-out',
					'bg-white/10 group-hover:bg-emerald-500/40 group-active:bg-emerald-400/60',

					// Scale effect on interaction
					'group-hover:scale-125 group-active:scale-150',

					// Glow effect
					'group-hover:shadow-[0_0_12px_rgba(52,211,153,0.6)]',

					// Direction-based sizing for grip indicator
					'data-[panel-group-direction=vertical]:h-1 data-[panel-group-direction=vertical]:w-12',
					'data-[panel-group-direction=horizontal]:w-1 data-[panel-group-direction=horizontal]:h-12',
				)}
			/>

			{/* Three dots grip pattern for better affordance */}
			<div
				className={cn(
					'absolute flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200',
					'data-[panel-group-direction=vertical]:flex-row',
					'data-[panel-group-direction=horizontal]:flex-col',
				)}
			>
				{[...Array(3)].map((_, i) => (
					<div
						key={i}
						className="w-1 h-1 rounded-full bg-emerald-400/80 group-active:bg-emerald-300"
					/>
				))}
			</div>
		</Separator>
	);
}

export { Panel, Group, Separator };
