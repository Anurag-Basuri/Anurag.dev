'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTerminalState } from './hooks/useTerminalState';
import { TerminalLayout } from './components/TerminalLayout';
import { TerminalHistory } from './components/TerminalHistory';
import { TerminalPrompt } from './components/TerminalPrompt';
import { CollapsedTerminal } from './components/CollapsedTerminal';
import { useCLI } from './hooks/useCLI';
import { collapsedVariants, expandedVariants } from './utils/variants';

interface CLIProps {
	onToggleCollapse?: () => void;
	isCollapsed?: boolean;
	onMaximize?: () => void;
	onMinimize?: () => void;
	onClose?: () => void;
}

export function CLI({
	onToggleCollapse,
	isCollapsed: externalIsCollapsed,
	onMaximize,
	onMinimize,
	onClose,
}: CLIProps) {
	const terminalState = useTerminalState();
	const { handleKeyDown } = useCLI(terminalState);

	/* The container height is managed by the layout (NavRail + Motion.div) */
	return (
		<TerminalLayout
			currentPath={terminalState.currentPath}
			historyLength={terminalState.history.length}
			onClearHistory={terminalState.clearHistory}
			onToggleCollapse={onToggleCollapse}
			onMaximize={onMaximize}
			onMinimize={onMinimize}
			onClose={onClose}
			isFocused={terminalState.isFocused}
		>
			<TerminalHistory history={terminalState.history} />
			<TerminalPrompt terminalState={terminalState} onKeyDown={handleKeyDown} />
		</TerminalLayout>
	);
}
