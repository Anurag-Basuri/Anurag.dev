'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TIMINGS } from '@/lib/constants';

interface PanelHeaderProps {
	type: 'sidebar' | 'terminal';
	icon: LucideIcon;
	title: string;
	subtitle?: string | null;
	controls?: React.ReactNode;
	onCollapse?: () => void;
	isFocused?: boolean;
	className?: string;
}

/**
 * Industry-grade unified panel header
 * Used by both Sidebar and Terminal for perfect consistency
 */
export function PanelHeader({
	type: _type,
	icon: Icon,
	title,
	subtitle,
	controls,
	isFocused = false,
	className,
}: PanelHeaderProps) {
	return (
		<header
			className={cn(
				'h-7 px-2',
				'bg-zinc-900/95 backdrop-blur-md',
				'border-b border-white/5',
				'flex items-center justify-between',
				'shrink-0 select-none',
				'relative z-20',
				'shadow-sm',
				className,
			)}
		>
			{/* Left: Controls + Icon + Title */}
			<div className="flex items-center gap-2">
				{controls}

				{/* Separator */}
				{controls && <div className="h-3.5 w-px bg-white/10" aria-hidden="true" />}

				{/* Icon + Title + Subtitle */}
				<div className="flex items-center gap-1.5 text-xs font-mono transition-colors">
					<Icon
						className={cn(
							'w-3.5 h-3.5 transition-all duration-200',
							isFocused
								? 'text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.5)]'
								: 'text-primary',
						)}
						aria-hidden="true"
					/>

					<span
						className={cn(
							'font-semibold tracking-tight transition-colors duration-200',
							isFocused ? 'text-emerald-300' : 'text-muted-foreground',
						)}
					>
						{title}
					</span>

					{subtitle && (
						<>
							<span
								className={cn(
									'transition-colors duration-200',
									isFocused ? 'text-emerald-500/70' : 'text-muted-foreground/40',
								)}
							>
								—
							</span>
							<span
								className={cn(
									'font-medium transition-colors duration-200',
									isFocused ? 'text-emerald-200' : 'text-accent',
								)}
							>
								{subtitle}
							</span>
						</>
					)}
				</div>
			</div>

			{/* Draggable Indicator */}
			<motion.div
				className="absolute left-1/2 -translate-x-1/2 top-0 w-8 h-1 rounded-full bg-white/10"
				whileHover={{
					backgroundColor: 'rgba(52, 211, 153, 0.3)',
					width: 48,
					transition: { duration: TIMINGS.fast / 1000 },
				}}
			/>
		</header>
	);
}
