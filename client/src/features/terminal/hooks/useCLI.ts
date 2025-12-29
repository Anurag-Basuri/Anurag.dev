'use client';
import { useCallback } from 'react';
import { useTerminalState } from './useTerminalState';

export function useCLI(terminalState: ReturnType<typeof useTerminalState>) {
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			const input = e.currentTarget;

			// Ctrl+L: Clear screen
			if (e.ctrlKey && e.key === 'l') {
				e.preventDefault();
				terminalState.clearHistory();
				return;
			}

			// Ctrl+C: Clear input and show ^C
			if (e.ctrlKey && e.key === 'c') {
				e.preventDefault();
				if (terminalState.input) {
					terminalState.addToHistory(terminalState.input, {
						type: 'error',
						content: '^C',
					});
				}
				terminalState.resetInput();
				return;
			}

			// Ctrl+U: Clear line (from cursor to start)
			if (e.ctrlKey && e.key === 'u') {
				e.preventDefault();
				const afterCursor = terminalState.input.slice(terminalState.cursorPos);
				terminalState.setInput(afterCursor);
				terminalState.setCursorPos(0);
				return;
			}

			// Ctrl+K: Clear line (from cursor to end)
			if (e.ctrlKey && e.key === 'k') {
				e.preventDefault();
				const beforeCursor = terminalState.input.slice(0, terminalState.cursorPos);
				terminalState.setInput(beforeCursor);
				return;
			}

			// Ctrl+A: Move cursor to start
			if (e.ctrlKey && e.key === 'a') {
				e.preventDefault();
				terminalState.setCursorPos(0);
				input.setSelectionRange(0, 0);
				return;
			}

			// Ctrl+E: Move cursor to end
			if (e.ctrlKey && e.key === 'e') {
				e.preventDefault();
				const len = terminalState.input.length;
				terminalState.setCursorPos(len);
				input.setSelectionRange(len, len);
				return;
			}

			// Home: Move cursor to start
			if (e.key === 'Home') {
				e.preventDefault();
				terminalState.setCursorPos(0);
				input.setSelectionRange(0, 0);
				return;
			}

			// End: Move cursor to end
			if (e.key === 'End') {
				e.preventDefault();
				const len = terminalState.input.length;
				terminalState.setCursorPos(len);
				input.setSelectionRange(len, len);
				return;
			}

			// Enter: Execute command (blocked during execution)
			if (e.key === 'Enter') {
				e.preventDefault();
				if (terminalState.isExecuting) return;
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

			// Arrow Up: Navigate command history
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

			// Arrow Down: Navigate command history
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

	return { handleKeyDown };
}
