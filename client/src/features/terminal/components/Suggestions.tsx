'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

const STYLES = {
	bar: 'h-9 px-3 bg-muted/30 backdrop-blur-md border-border/30 flex items-center shrink-0',
} as const;

interface SuggestionsProps {
	items: string[];
	activeIndex: number;
	onSelect: (s: string) => void;
	onHover: (i: number) => void;
}

export const Suggestions = memo(function Suggestions({
	items,
	activeIndex,
	onSelect,
	onHover,
}: SuggestionsProps) {
	if (!items.length) return null;

	return (
		<div
			className={cn(
				STYLES.bar,
				'border-t gap-1.5 sm:gap-2 flex-wrap h-auto py-1.5 sm:py-2 animate-in fade-in slide-in-from-bottom-1 duration-150',
			)}
		>
			<span className="text-[10px] font-bold text-primary/50 uppercase tracking-widest flex items-center gap-1">
				<span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary/50" />
				<span className="hidden sm:inline">Tab</span>
			</span>
			{items.map((s, i) => (
				<button
					key={s}
					onClick={() => onSelect(s)}
					onMouseEnter={() => onHover(i)}
					className={cn(
						'px-1.5 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-mono transition-all duration-150 active:scale-95',
						i === activeIndex
							? 'bg-primary/15 text-primary border border-primary/30'
							: 'bg-muted/50 text-muted-foreground border border-transparent hover:bg-muted hover:text-foreground',
					)}
				>
					{s}
				</button>
			))}
		</div>
	);
});
