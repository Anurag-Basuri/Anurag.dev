'use client';

import { Panel, Group, Separator } from 'react-resizable-panels';
import { cn } from '@/lib/utils';

interface ResizeHandleProps {
	className?: string;
	id?: string;
}

// Premium ResizeHandle with industry-grade UI/UX
function ResizeHandle({ className, id }: ResizeHandleProps) {
	return (
		<Separator
			id={id}
			className={cn(
				// Base structure
				'group relative flex items-center justify-center z-20',
				'backdrop-blur-sm',
				'transition-all duration-300 ease-out',

				// v4 API: aria-orientation for direction
				'aria-[orientation=vertical]:w-4 aria-[orientation=vertical]:h-full aria-[orientation=vertical]:cursor-col-resize',
				'aria-[orientation=horizontal]:h-4 aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:cursor-row-resize',

				// v4 API: data-separator state styling
				'data-[separator=inactive]:bg-transparent',
				'data-[separator=hover]:bg-emerald-500/10',
				'data-[separator=drag]:bg-emerald-500/20',

				className,
			)}
		>
			{/* Primary grip line with gradient and glow */}
			<div
				className={cn(
					'absolute rounded-full',
					'transition-all duration-300 ease-out',

					// Gradient background
					'bg-linear-to-r from-transparent via-white/15 to-transparent',
					'data-[separator=hover]:via-emerald-400/50 data-[separator=hover]:from-emerald-500/20 data-[separator=hover]:to-emerald-500/20',
					'data-[separator=drag]:via-emerald-300/70 data-[separator=drag]:from-emerald-500/30 data-[separator=drag]:to-emerald-500/30',

					// Glow effects
					'data-[separator=hover]:shadow-[0_0_16px_rgba(52,211,153,0.5),0_0_32px_rgba(52,211,153,0.25)]',
					'data-[separator=drag]:shadow-[0_0_24px_rgba(52,211,153,0.7),0_0_48px_rgba(52,211,153,0.35)]',

					// Size based on orientation
					'aria-[orientation=vertical]:w-0.5 aria-[orientation=vertical]:h-12',
					'aria-[orientation=horizontal]:h-0.5 aria-[orientation=horizontal]:w-12',

					// Scale on interaction
					'group-hover:aria-[orientation=vertical]:h-16 group-hover:aria-[orientation=vertical]:w-1',
					'group-hover:aria-[orientation=horizontal]:w-16 group-hover:aria-[orientation=horizontal]:h-1',
					'data-[separator=drag]:scale-110',
				)}
			/>

			{/* Three-dot grip indicator */}
			<div
				className={cn(
					'absolute flex gap-1',
					'opacity-0 transition-opacity duration-300',
					'data-[separator=hover]:opacity-100 data-[separator=drag]:opacity-100',

					// Orientation-based layout
					'aria-[orientation=vertical]:flex-col',
					'aria-[orientation=horizontal]:flex-row',
				)}
			>
				{[0, 1, 2].map(i => (
					<div
						key={i}
						className={cn(
							'w-1.5 h-1.5 rounded-full',
							'bg-linear-to-br from-emerald-400 to-emerald-500',
							'shadow-[0_0_8px_rgba(52,211,153,0.8)]',
							'transition-transform duration-200',
							'data-[separator=drag]:scale-125 data-[separator=drag]:from-emerald-300 data-[separator=drag]:to-emerald-400',
						)}
					/>
				))}
			</div>

			{/* Edge highlight for visibility */}
			<div
				className={cn(
					'absolute',
					'opacity-0 transition-opacity duration-300',
					'data-[separator=hover]:opacity-100',

					// Subtle edge glow
					'bg-linear-to-r from-transparent via-emerald-400/30 to-transparent',

					// Position based on orientation
					'aria-[orientation=vertical]:w-px aria-[orientation=vertical]:h-full aria-[orientation=vertical]:left-0',
					'aria-[orientation=horizontal]:h-px aria-[orientation=horizontal]:w-full aria-[orientation=horizontal]:top-0',
				)}
			/>
		</Separator>
	);
}

export { Panel, Group, ResizeHandle };
