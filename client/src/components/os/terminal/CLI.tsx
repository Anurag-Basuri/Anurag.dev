'use client';

import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTerminalState } from './useTerminalState';
import { TerminalLayout } from './TerminalLayout';
import { TerminalHistory } from './TerminalHistory';
import { TerminalPrompt } from './TerminalPrompt';

interface CLIProps {
	onToggleCollapse?: () => void;
	isCollapsed?: boolean;
}

export function CLI({ onToggleCollapse, isCollapsed: externalIsCollapsed }: CLIProps) {
	const terminalState = useTerminalState();

	// Handlers
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			// Ctrl+L: Clear screen
			if (e.ctrlKey && e.key === 'l') {
				e.preventDefault();
				terminalState.clearHistory();
				return;
			}

			// Ctrl+C: Clear input
			if (e.ctrlKey && e.key === 'c') {
				e.preventDefault();
				terminalState.resetInput();
				terminalState.addToHistory(terminalState.input, { type: 'error', content: '^C' });
				return;
			}

			// Enter: Execute command
			if (e.key === 'Enter') {
				e.preventDefault();
				if (terminalState.input.trim()) {
					terminalState.executeCommand(terminalState.input);
					terminalState.resetInput();
				}
				return;
			}

			// Tab: Cycle through suggestions or apply first one
			if (e.key === 'Tab') {
				e.preventDefault();
				if (terminalState.suggestions.length > 0) {
					if (e.shiftKey) {
						// Shift+Tab: Previous suggestion
						const newIndex =
							terminalState.activeSuggestionIndex > 0
								? terminalState.activeSuggestionIndex - 1
								: terminalState.suggestions.length - 1;
						terminalState.setActiveSuggestionIndex(newIndex);
						terminalState.applySuggestion(terminalState.suggestions[newIndex]);
					} else {
						// Tab: Next suggestion or apply current
						const newIndex =
							(terminalState.activeSuggestionIndex + 1) %
							terminalState.suggestions.length;
						terminalState.setActiveSuggestionIndex(newIndex);
						terminalState.applySuggestion(terminalState.suggestions[newIndex]);
					}
				}
				return;
			}

			// Escape: Clear suggestions and reset
			if (e.key === 'Escape') {
				e.preventDefault();
				terminalState.setActiveSuggestionIndex(0);
				return;
			}

			// Arrow Up: Always navigate command history
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				if (terminalState.cmdHistory.length > 0) {
					const newIndex =
						terminalState.historyIndex === -1
							? terminalState.cmdHistory.length - 1
							: Math.max(0, terminalState.historyIndex - 1);
					terminalState.setHistoryIndex(newIndex);
					const command = terminalState.cmdHistory[newIndex];
					terminalState.setInput(command);
					terminalState.setCursorPos(command.length);
				}
				return;
			}

			// Arrow Down: Always navigate command history
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				if (terminalState.historyIndex !== -1) {
					const newIndex = terminalState.historyIndex + 1;
					if (newIndex >= terminalState.cmdHistory.length) {
						terminalState.setHistoryIndex(-1);
						terminalState.setInput('');
						terminalState.setCursorPos(0);
					} else {
						terminalState.setHistoryIndex(newIndex);
						const command = terminalState.cmdHistory[newIndex];
						terminalState.setInput(command);
						terminalState.setCursorPos(command.length);
					}
				}
				return;
			}

			// Page Up: Jump to first command in history
			if (e.key === 'PageUp') {
				e.preventDefault();
				if (terminalState.cmdHistory.length > 0) {
					terminalState.setHistoryIndex(0);
					const command = terminalState.cmdHistory[0];
					terminalState.setInput(command);
					terminalState.setCursorPos(command.length);
				}
				return;
			}

			// Page Down: Clear to current input
			if (e.key === 'PageDown') {
				e.preventDefault();
				terminalState.setHistoryIndex(-1);
				terminalState.setInput('');
				terminalState.setCursorPos(0);
				return;
			}
		},
		[terminalState],
	);

	return (
		<AnimatePresence mode="wait">
			{externalIsCollapsed ? (
				<motion.div
					key="collapsed"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.15 }}
					className="h-full flex items-center justify-center"
				>
					<button
						onClick={onToggleCollapse}
						className="group flex items-center justify-center w-full h-full cursor-pointer hover:bg-primary/5 transition-colors duration-200"
						aria-label="Expand Terminal"
					>
						<div className="w-64 h-1 rounded-full bg-white/20 group-hover:bg-primary/50 transition-all duration-200 shadow-[0_0_8px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_16px_var(--primary)]" />
					</button>
				</motion.div>
			) : (
				<motion.div
					key="expanded"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					className="h-full w-full rounded-sm border border-white/10 bg-[#0d1117] shadow-2xl overflow-hidden"
				>
					<TerminalLayout
						currentPath={terminalState.currentPath}
						historyLength={terminalState.history.length}
						onClearHistory={terminalState.clearHistory}
						onToggleCollapse={onToggleCollapse}
					>
						<TerminalHistory history={terminalState.history} />
						<TerminalPrompt terminalState={terminalState} onKeyDown={handleKeyDown} />
					</TerminalLayout>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
