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
				// Enhanced base styles with better hit area
				'group relative flex items-center justify-center',
				'transition-all duration-300 ease-out',

				// Direction-based sizing with larger interactive area
				'data-[panel-group-direction=vertical]:h-3 data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:cursor-row-resize data-[panel-group-direction=vertical]:hover:h-4',
				'data-[panel-group-direction=horizontal]:w-3 data-[panel-group-direction=horizontal]:h-full data-[panel-group-direction=horizontal]:cursor-col-resize data-[panel-group-direction=horizontal]:hover:w-4',

				// Subtle gradient background for depth
				'bg-linear-to-br from-transparent via-white/5 to-transparent',
				'hover:from-emerald-500/10 hover:via-emerald-500/20 hover:to-emerald-500/10',
				'active:from-emerald-500/20 active:via-emerald-500/30 active:to-emerald-500/20',

				// Layering and effects
				'z-20',
				'backdrop-blur-sm',

				className,
			)}
		>
			{/* Main visual grip line with glow */}
			<div
				className={cn(
					'absolute rounded-full transition-all duration-300 ease-out',
					'bg-linear-to-r from-transparent via-white/20 to-transparent',
					'group-hover:via-emerald-400/60 group-hover:from-emerald-500/20 group-hover:to-emerald-500/20',
					'group-active:via-emerald-300/80 group-active:scale-110',

					// Pulsing glow effect on hover
					'group-hover:shadow-[0_0_20px_rgba(52,211,153,0.6),0_0_40px_rgba(52,211,153,0.3)]',
					'group-active:shadow-[0_0_30px_rgba(52,211,153,0.8),0_0_60px_rgba(52,211,153,0.4)]',

					// Direction-based sizing
					'data-[panel-group-direction=vertical]:h-0.5 data-[panel-group-direction=vertical]:w-16 data-[panel-group-direction=vertical]:group-hover:h-1 data-[panel-group-direction=vertical]:group-hover:w-20',
					'data-[panel-group-direction=horizontal]:w-0.5 data-[panel-group-direction=horizontal]:h-16 data-[panel-group-direction=horizontal]:group-hover:w-1 data-[panel-group-direction=horizontal]:group-hover:h-20',
				)}
			/>

			{/* Animated grip dots pattern */}
			<div
				className={cn(
					'absolute flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300',
					'data-[panel-group-direction=vertical]:flex-row',
					'data-[panel-group-direction=horizontal]:flex-col',
				)}
			>
				{[...Array(3)].map((_, i) => (
					<div
						key={i}
						className={cn(
							'w-1.5 h-1.5 rounded-full',
							'bg-linear-to-br from-emerald-400 to-emerald-500',
							'shadow-[0_0_6px_rgba(52,211,153,0.8)]',
							'group-active:scale-125 group-active:from-emerald-300 group-active:to-emerald-400',
							'transition-transform duration-200',
							// Staggered animation
							i === 0 && 'group-hover:animate-pulse',
							i === 1 && 'group-hover:animate-pulse animation-delay-100',
							i === 2 && 'group-hover:animate-pulse animation-delay-200',
						)}
						style={{
							animationDelay: `${i * 100}ms`,
						}}
					/>
				))}
			</div>

			{/* Edge highlight for better visibility */}
			<div
				className={cn(
					'absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300',
					'bg-linear-to-r from-transparent via-emerald-400/40 to-transparent',
					'data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:top-0',
					'data-[panel-group-direction=horizontal]:w-px data-[panel-group-direction=horizontal]:h-full data-[panel-group-direction=horizontal]:left-0',
				)}
			/>
		</Separator>
	);
}

export { Panel, Group, ResizeHandle };
