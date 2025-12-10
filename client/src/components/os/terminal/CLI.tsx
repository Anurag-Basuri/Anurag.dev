'use client';

import { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTerminalState } from './useTerminalState';
import { TerminalLayout } from './TerminalLayout';
import { TerminalHistory } from './TerminalHistory';
import { TerminalPrompt } from './TerminalPrompt';
import { Terminal } from 'lucide-react';

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

	// Animation variants for smooth spring-based transitions
	const expandedVariants = {
		initial: { opacity: 0, y: 20, scale: 0.98 },
		animate: {
			opacity: 1,
			y: 0,
			scale: 1,
			transition: {
				type: 'spring',
				stiffness: 300,
				damping: 25,
			},
		},
		exit: {
			opacity: 0,
			y: 10,
			scale: 0.98,
			transition: { duration: 0.15 },
		},
	} as const;

	const collapsedVariants = {
		initial: { opacity: 0 },
		animate: {
			opacity: 1,
			transition: { duration: 0.15 },
		},
		exit: {
			opacity: 0,
			transition: { duration: 0.1 },
		},
	} as const;

	return (
		<AnimatePresence mode="wait">
			{externalIsCollapsed ? (
				<motion.div
					key="collapsed"
					variants={collapsedVariants}
					initial="initial"
					animate="animate"
					exit="exit"
					className="h-full flex items-center justify-center bg-[#0d1117]/20 backdrop-blur-sm rounded-sm border border-white/5"
				>
					<button
						onClick={onToggleCollapse}
						className="group flex items-center justify-center gap-3 w-full h-full cursor-pointer hover:bg-white/5 transition-all duration-200 rounded-sm"
						aria-label="Expand Terminal"
					>
						<Terminal className="w-4 h-4 text-white/30 group-hover:text-emerald-400 transition-colors" />
						<div className="w-32 h-0.5 rounded-full bg-white/10 group-hover:bg-emerald-400/50 transition-all duration-200" />
						<span className="text-[10px] text-white/30 group-hover:text-white/60 uppercase tracking-wider transition-colors">
							Expand
						</span>
					</button>
				</motion.div>
			) : (
				<motion.div
					key="expanded"
					variants={expandedVariants}
					initial="initial"
					animate="animate"
					exit="exit"
					className="h-full w-full rounded-sm border border-white/10 bg-[#0d1117]/20 backdrop-blur-xl shadow-2xl overflow-hidden"
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
