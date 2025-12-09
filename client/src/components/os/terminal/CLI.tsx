'use client';

import { useCallback } from 'react';
import { useTerminalState } from './useTerminalState';
import { TerminalLayout } from './TerminalLayout';
import { TerminalHistory } from './TerminalHistory';
import { TerminalPrompt } from './TerminalPrompt';
import { Terminal as TerminalIcon, MoreHorizontal, ChevronUp } from 'lucide-react';

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

	// Collapsed view
	if (externalIsCollapsed) {
		return (
			<div
				onClick={onToggleCollapse}
				className="h-full flex items-center justify-center bg-transparent cursor-pointer group"
			>
				<div className="flex items-center gap-3 px-4 py-2 bg-background/80 backdrop-blur-sm border border-border/60 rounded-lg shadow-sm group-hover:border-primary/50 group-hover:bg-background/90 transition-all duration-200">
					<TerminalIcon className="w-4 h-4 text-primary" />
					<span className="text-sm font-medium text-foreground">Terminal</span>
					<MoreHorizontal className="w-4 h-4 text-muted-foreground" />
					<ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
				</div>
			</div>
		);
	}

	return (
		<TerminalLayout
			currentPath={terminalState.currentPath}
			historyLength={terminalState.history.length}
			onClearHistory={terminalState.clearHistory}
			onToggleCollapse={onToggleCollapse}
		>
			<TerminalHistory history={terminalState.history} />
			<TerminalPrompt terminalState={terminalState} onKeyDown={handleKeyDown} />
		</TerminalLayout>
	);
}
