'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTerminalState } from './useTerminalState';
import { TerminalLayout } from './TerminalLayout';
import { TerminalHistory } from './TerminalHistory';
import { TerminalPrompt } from './TerminalPrompt';
import { MoreHorizontal } from 'lucide-react';

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

			// Enter: Execute command (always execute, don't apply suggestions)
			if (e.key === 'Enter') {
				e.preventDefault();
				if (terminalState.input.trim()) {
					terminalState.executeCommand(terminalState.input);
					terminalState.resetInput();
				}
				return;
			}

			// Tab: Apply first suggestion
			if (e.key === 'Tab') {
				e.preventDefault();
				if (terminalState.suggestions.length > 0) {
					const suggestion =
						terminalState.suggestions[terminalState.activeSuggestionIndex];
					terminalState.applySuggestion(suggestion);
				}
				return;
			}

			// Escape: Clear suggestions
			if (e.key === 'Escape') {
				e.preventDefault();
				terminalState.setActiveSuggestionIndex(0);
				return;
			}

			// Arrow Up: Previous command or navigate suggestions
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				if (terminalState.suggestions.length > 0) {
					const newIndex =
						terminalState.activeSuggestionIndex > 0
							? terminalState.activeSuggestionIndex - 1
							: terminalState.suggestions.length - 1;
					terminalState.setActiveSuggestionIndex(newIndex);
				} else if (terminalState.cmdHistory.length > 0) {
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

			// Arrow Down: Next command
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				if (terminalState.suggestions.length > 0) {
					const newIndex =
						terminalState.activeSuggestionIndex < terminalState.suggestions.length - 1
							? terminalState.activeSuggestionIndex + 1
							: 0;
					terminalState.setActiveSuggestionIndex(newIndex);
				} else if (terminalState.historyIndex !== -1) {
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

			// Page Up/Down for history navigation
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
					initial={{ opacity: 0, scale: 0.8, y: 20 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.8, y: 20 }}
					transition={{ type: 'spring', stiffness: 300, damping: 25 }}
					className="h-full flex items-start justify-center pt-2"
				>
					<button
						onClick={onToggleCollapse}
						className="group flex items-center justify-center w-full h-full cursor-pointer hover:bg-primary/5 transition-colors duration-300"
						aria-label="Expand Terminal"
					>
						<div className="w-96 h-1 rounded-full bg-white/20 group-hover:bg-primary/50 transition-all duration-300 shadow-[0_0_10px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_20px_var(--primary)]" />
					</button>
				</motion.div>
			) : (
				<motion.div
					key="expanded"
					initial={{ opacity: 0, scale: 0.98, y: 10 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.98, y: 10 }}
					transition={{ type: 'spring', stiffness: 400, damping: 30 }}
					className="h-full w-full"
				>
					<TerminalLayout
						currentPath={terminalState.currentPath}
						historyLength={terminalState.history.length}
						onClearHistory={terminalState.clearHistory}
						onToggleCollapse={onToggleCollapse}
					>
						<TerminalHistory history={terminalState.history} />
						<div className="shrink-0 pt-2 pb-1 px-4 bg-linear-to-t from-background/95 via-background/90 to-transparent backdrop-blur-sm z-10 border-t border-white/5">
							<TerminalPrompt
								terminalState={terminalState}
								onKeyDown={handleKeyDown}
							/>
						</div>
					</TerminalLayout>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
