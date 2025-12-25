'use client';

import { LucideIcon, ChevronRight, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsedPanelProps {
	icon: LucideIcon;
	label: string;
	orientation: 'horizontal' | 'vertical';
	onExpand: () => void;
}

/**
 * Minimal collapsed panel indicator
 */
export function CollapsedPanel({ icon: Icon, label, orientation, onExpand }: CollapsedPanelProps) {
	const isVertical = orientation === 'vertical';

	return (
		<button
			onClick={onExpand}
			className={cn(
				'h-full w-full',
				'flex items-center justify-center gap-2',
				'bg-zinc-900/80 backdrop-blur-md',
				'border-0 outline-none cursor-pointer',
				'transition-colors duration-200',
				'hover:bg-zinc-800/90',
				'group',
			)}
		>
			{isVertical ? (
				// Sidebar - vertical layout
				<div className="flex flex-col items-center gap-3 py-4">
					<Icon className="w-4 h-4 text-white/40 group-hover:text-emerald-400 transition-colors" />
					<span
						className="text-[10px] font-medium tracking-widest text-white/30 group-hover:text-white/60 transition-colors"
						style={{ writingMode: 'vertical-rl' }}
					>
						{label.toUpperCase()}
					</span>
					<ChevronRight className="w-3 h-3 text-white/20 group-hover:text-emerald-400 transition-colors" />
				</div>
			) : (
				// Terminal - horizontal layout
				<>
					<Icon className="w-4 h-4 text-white/40 group-hover:text-emerald-400 transition-colors" />
					<span className="text-xs font-medium text-white/30 group-hover:text-white/60 transition-colors">
						{label}
					</span>
					<ChevronUp className="w-3 h-3 text-white/20 group-hover:text-emerald-400 transition-colors" />
				</>
			)}
		</button>
	);
}
