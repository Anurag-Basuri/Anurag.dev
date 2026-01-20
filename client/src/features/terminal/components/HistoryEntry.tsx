'use client';

import { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { HistoryItem } from '../types';

interface HistoryEntryProps {
	item: HistoryItem;
	isNew?: boolean;
}

export const HistoryEntry = memo(function HistoryEntry({ item, isNew }: HistoryEntryProps) {
	return (
		<div
			className={cn(
				'space-y-1.5 py-1',
				'border-l-2 border-transparent hover:border-primary/20 pl-2 -ml-2',
				'transition-all duration-200',
				isNew && 'animate-in fade-in slide-in-from-bottom-2',
			)}
			style={{ contentVisibility: 'auto', containIntrinsicSize: '24px' }}
		>
			{item.command && (
				<div className="flex items-start gap-1.5 sm:gap-2 text-xs font-mono">
					<ChevronRight className="w-3 h-3 text-primary/60 shrink-0 mt-0.5" />
					<span className="text-muted-foreground/50 truncate max-w-[80px] sm:max-w-none">
						{item.path}
					</span>
					<span className="text-primary/60">$</span>
					<span className="text-foreground/90 break-all font-medium">{item.command}</span>
				</div>
			)}
			{item.response.content && (
				<div
					className={cn(
						'text-xs font-mono pl-4 sm:pl-5 whitespace-pre-wrap wrap-break-word leading-relaxed',
						item.response.type === 'error'
							? 'text-destructive/90 bg-destructive/5 rounded px-2 py-1 -ml-2'
							: item.response.type === 'success'
								? 'text-primary/80'
								: 'text-muted-foreground',
					)}
				>
					{item.response.content}
				</div>
			)}
		</div>
	);
});
