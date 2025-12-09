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
		<div className="h-full flex flex-col bg-linear-to-b from-background/98 to-background/95 backdrop-blur-md text-foreground font-mono text-sm overflow-hidden rounded-lg border border-white/5 shadow-2xl">
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
