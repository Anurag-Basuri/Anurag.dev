import { memo, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { CommandResponse, HistoryItem } from '../types';

const responseTone = (type: CommandResponse['type']): string => {
	switch (type) {
		case 'error':
			return 'text-red-400';
		case 'success':
			return 'text-emerald-400';
		case 'text':
			return 'text-white/80';
		default:
			return 'text-white/60';
	}
};

interface HistoryItemComponentProps {
	item: HistoryItem;
	onItemClick?: (item: HistoryItem) => void;
}

const HistoryItemComponent = memo(({ item, onItemClick }: HistoryItemComponentProps) => {
	const handleClick = useCallback(() => {
		onItemClick?.(item);
	}, [item, onItemClick]);

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 8 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -4 }}
			transition={{ duration: 0.15, ease: 'easeOut' }}
			className="space-y-1 cursor-pointer hover:bg-white/5 rounded px-2 py-1 -mx-2 transition-colors"
			onClick={handleClick}
		>
			<div className="flex gap-2 text-sm items-baseline">
				<span className="shrink-0 text-emerald-400">❯</span>
				<span className="flex-1 break-all text-white/90">{item.command}</span>
			</div>
			{item.response.content && (
				<div
					className={cn(
						'pl-5 text-xs whitespace-pre-wrap leading-relaxed',
						responseTone(item.response.type),
					)}
				>
					{item.response.content}
				</div>
			)}
		</motion.div>
	);
});

HistoryItemComponent.displayName = 'HistoryItemComponent';

interface OptimizedTerminalOutputProps {
	history: HistoryItem[];
	maxVisibleItems?: number;
	onItemClick?: (item: HistoryItem) => void;
}

export function OptimizedTerminalOutput({
	history,
	maxVisibleItems = 50,
	onItemClick,
}: OptimizedTerminalOutputProps) {
	// Memoize the history slice to prevent unnecessary re-renders
	const visibleHistory = useMemo(() => {
		return history.slice(-maxVisibleItems);
	}, [history, maxVisibleItems]);

	// Memoize click handler
	const handleItemClick = useCallback(
		(item: HistoryItem) => {
			onItemClick?.(item);
		},
		[onItemClick],
	);

	if (visibleHistory.length === 0) {
		return null;
	}

	// Show truncation notice if history is longer than visible items
	const showTruncationNotice = history.length > maxVisibleItems;

	return (
		<div className="space-y-2">
			{showTruncationNotice && (
				<div className="text-xs text-muted-foreground italic px-2">
					Showing last {maxVisibleItems} of {history.length} commands
				</div>
			)}
			<AnimatePresence initial={false} mode="popLayout">
				{visibleHistory.map(item => (
					<HistoryItemComponent key={item.id} item={item} onItemClick={handleItemClick} />
				))}
			</AnimatePresence>
		</div>
	);
}
