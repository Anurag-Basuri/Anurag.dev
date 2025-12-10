'use client';

import { ReactNode } from 'react';
import { TerminalHeader } from './TerminalHeader';

interface TerminalLayoutProps {
	children: ReactNode;
	onToggleCollapse?: () => void;
	currentPath: string;
	historyLength: number;
	onClearHistory: () => void;
}

export function TerminalLayout({
	children,
	onToggleCollapse,
	currentPath,
	historyLength,
	onClearHistory,
}: TerminalLayoutProps) {
	return (
		<div className="h-full flex flex-col bg-card/95 backdrop-blur-xl border border-border/40 text-foreground font-mono text-sm overflow-hidden rounded-md shadow-inner">
			<TerminalHeader
				currentPath={currentPath}
				historyLength={historyLength}
				onClearHistory={onClearHistory}
				onToggleCollapse={onToggleCollapse!}
			/>
			<div className="flex-1 min-h-0 flex flex-col relative">{children}</div>
		</div>
	);
}
