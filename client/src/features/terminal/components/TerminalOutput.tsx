'use client';
import { useMemo } from 'react';
import { OptimizedTerminalOutput } from './VirtualizedTerminalOutput';
import { HistoryItem } from '../types';

interface TerminalOutputProps {
	history: HistoryItem[];
	maxVisibleItems?: number;
	onItemClick?: (item: HistoryItem) => void;
}

export function TerminalOutput({
	history,
	maxVisibleItems = 50,
	onItemClick,
}: TerminalOutputProps) {
	// Memoize the history to prevent unnecessary re-renders
	const memoizedHistory = useMemo(() => history, [history]);

	return (
		<OptimizedTerminalOutput
			history={memoizedHistory}
			maxVisibleItems={maxVisibleItems}
			onItemClick={onItemClick}
		/>
	);
}
