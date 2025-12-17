'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useTerminalState } from './useTerminalState';
import { TerminalLayout } from './TerminalLayout';
import { TerminalHistory } from './TerminalHistory';
import { TerminalPrompt } from './TerminalPrompt';
import { CollapsedTerminal } from './CollapsedTerminal';
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

	return (
		<AnimatePresence mode="wait">
			{externalIsCollapsed ? (
				<motion.div
					key="collapsed"
					variants={collapsedVariants}
					initial="initial"
					animate="animate"
					exit="exit"
					className="h-full w-full"
				>
					<CollapsedTerminal onExpand={onToggleCollapse!} />
				</motion.div>
			) : (
				<motion.div
					key="expanded"
					variants={expandedVariants}
					initial="initial"
					animate="animate"
					exit="exit"
					className="h-full w-full overflow-hidden"
				>
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
				</motion.div>
			)}
		</AnimatePresence>
	);
}
