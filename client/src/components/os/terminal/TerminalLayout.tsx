'use client';

import { ReactNode } from 'react';
import { TerminalHeader } from './TerminalHeader';

interface TerminalLayoutProps {
	children: ReactNode;
	onToggleCollapse?: () => void;
	currentPath: string;
	historyLength: number;
	onClearHistory: () => void;
	onMaximize?: () => void;
	onMinimize?: () => void;
	onClose?: () => void;
}

export function TerminalLayout({
	children,
	onToggleCollapse,
	currentPath,
	historyLength,
	onClearHistory,
	onMaximize,
	onMinimize,
	onClose,
}: TerminalLayoutProps) {
	return (
		<div className="h-full flex flex-col text-foreground font-mono text-sm overflow-hidden">
			<TerminalHeader
				currentPath={currentPath}
				historyLength={historyLength}
				onClearHistory={onClearHistory}
				onToggleCollapse={onToggleCollapse!}
				onMaximize={onMaximize}
				onMinimize={onMinimize}
				onClose={onClose}
			/>
			<div className="flex-1 min-h-0 flex flex-col relative">{children}</div>
		</div>
	);
}
