'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useCollapsiblePanel } from '@/hooks/use-collapsible-panel';
import { useTerminalState } from './hooks/useTerminalState';
import { TerminalLayout } from './components/TerminalLayout';
import { TerminalHistory } from './components/TerminalHistory';
import { TerminalPrompt } from './components/TerminalPrompt';
import { CollapsedTerminal } from './components/CollapsedTerminal';
import { useCLI } from './hooks/useCLI';
export function CLI() {
	const terminal = useCollapsiblePanel({ type: 'terminal' });
	const terminalState = useTerminalState();
	const { handleKeyDown } = useCLI(terminalState);

	return (
		<div className="h-full w-full">
			<AnimatePresence mode="wait">
				{terminal.isCollapsed ? (
					<motion.div
						key="collapsed-terminal"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="h-full w-full"
					>
						<CollapsedTerminal onExpand={terminal.expand} />
					</motion.div>
				) : (
					<motion.div
						key="expanded-terminal"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.2 }}
						className="h-full"
					>
						<TerminalLayout
							currentPath={terminalState.currentPath}
							historyLength={terminalState.history.length}
							onClearHistory={terminalState.clearHistory}
							onToggleCollapse={terminal.collapse}
							onMaximize={terminal.maximize}
							onMinimize={terminal.collapse}
							onClose={terminal.collapse}
							isFocused={terminalState.isFocused}
						>
							<TerminalHistory history={terminalState.history} />
							<TerminalPrompt
								terminalState={terminalState}
								onKeyDown={handleKeyDown}
							/>
						</TerminalLayout>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
