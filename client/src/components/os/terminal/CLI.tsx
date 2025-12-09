'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Terminal } from 'lucide-react';
import { TerminalHeader } from './TerminalHeader';
import { TerminalWelcome } from './TerminalWelcome';
import { TerminalOutput } from './TerminalOutput';
import { TerminalInput } from './TerminalInput';
import { CommandSuggestions } from './CommandSuggestions';
import { useTerminalState } from './useTerminalState';

interface CLIProps {
	onToggleCollapse?: () => void;
	isCollapsed?: boolean;
}

export function CLI({ onToggleCollapse, isCollapsed: externalIsCollapsed }: CLIProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	const terminalState = useTerminalState();

	// Effects
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [terminalState.history]);

	// Auto-focus input on mount
	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	// Handlers
	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			// Announce actions to screen readers
			const announceAction = (message: string) => {
				if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
					const utterance = new SpeechSynthesisUtterance(message);
					utterance.rate = 1.5;
					window.speechSynthesis.speak(utterance);
				}
			};

			// Ctrl+L: Clear screen
			if (e.ctrlKey && e.key === 'l') {
				e.preventDefault();
				terminalState.clearHistory();
				announceAction('Terminal cleared');
				return;
			}

			// Ctrl+C: Clear input
			if (e.ctrlKey && e.key === 'c') {
				e.preventDefault();
				terminalState.resetInput();
				terminalState.addToHistory(terminalState.input, { type: 'error', content: '^C' });
				announceAction('Command cancelled');
				return;
			}

			// Enter: Execute command
			if (e.key === 'Enter') {
				e.preventDefault();
				if (terminalState.suggestions.length > 0 && terminalState.activeSuggestionIndex >= 0) {
					const suggestion = terminalState.suggestions[terminalState.activeSuggestionIndex];
					terminalState.applySuggestion(suggestion);
					announceAction(`Applied suggestion: ${suggestion}`);
				} else {
					terminalState.executeCommand(terminalState.input);
					terminalState.resetInput();
					announceAction('Command executed');
				}
				return;
			}

			// Tab: Apply first suggestion
			if (e.key === 'Tab') {
				e.preventDefault();
				if (terminalState.suggestions.length > 0) {
					const suggestion = terminalState.suggestions[terminalState.activeSuggestionIndex];
					terminalState.applySuggestion(suggestion);
					announceAction(`Autocompleted: ${suggestion}`);
				}
				return;
			}

			// Escape: Clear suggestions
			if (e.key === 'Escape') {
				e.preventDefault();
				terminalState.setActiveSuggestionIndex(0);
				announceAction('Suggestions cleared');
				return;
			}

			// Arrow Up: Previous command or navigate suggestions
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				if (terminalState.suggestions.length > 0) {
					const newIndex = Math.max(0, terminalState.activeSuggestionIndex - 1);
					terminalState.setActiveSuggestionIndex(newIndex);
					const suggestion = terminalState.suggestions[newIndex];
					announceAction(`Suggestion ${newIndex + 1}: ${suggestion}`);
				} else if (terminalState.cmdHistory.length > 0) {
					const newIndex =
						terminalState.historyIndex === -1 
							? terminalState.cmdHistory.length - 1 
							: Math.max(0, terminalState.historyIndex - 1);
					terminalState.setHistoryIndex(newIndex);
					const cmd = terminalState.cmdHistory[newIndex];
					terminalState.setInput(cmd);
					terminalState.setCursorPos(cmd.length);
					announceAction(`Previous command: ${cmd}`);
				}
				return;
			}

			// Arrow Down: Next command
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				if (terminalState.suggestions.length > 0) {
					const newIndex = Math.min(terminalState.suggestions.length - 1, terminalState.activeSuggestionIndex + 1);
					terminalState.setActiveSuggestionIndex(newIndex);
					const suggestion = terminalState.suggestions[newIndex];
					announceAction(`Suggestion ${newIndex + 1}: ${suggestion}`);
				} else if (terminalState.historyIndex !== -1) {
					if (terminalState.historyIndex === terminalState.cmdHistory.length - 1) {
						terminalState.setHistoryIndex(-1);
						terminalState.setInput('');
						terminalState.setCursorPos(0);
						announceAction('Cleared command history navigation');
					} else {
						const newIndex = Math.min(terminalState.cmdHistory.length - 1, terminalState.historyIndex + 1);
						terminalState.setHistoryIndex(newIndex);
						const cmd = terminalState.cmdHistory[newIndex];
						terminalState.setInput(cmd);
						terminalState.setCursorPos(cmd.length);
						announceAction(`Next command: ${cmd}`);
					}
				}
				return;
			}

			// Page Up/Down for history navigation
			if (e.key === 'PageUp') {
				e.preventDefault();
				if (terminalState.cmdHistory.length > 0) {
					terminalState.setHistoryIndex(0);
					const cmd = terminalState.cmdHistory[0];
					terminalState.setInput(cmd);
					terminalState.setCursorPos(cmd.length);
					announceAction('First command in history');
				}
				return;
			}

			if (e.key === 'PageDown') {
				e.preventDefault();
				terminalState.setHistoryIndex(-1);
				terminalState.setInput('');
				terminalState.setCursorPos(0);
				announceAction('Cleared to current input');
				return;
			}
		},
		[terminalState],
	);

	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		terminalState.setInput(e.target.value);
		terminalState.setCursorPos(e.target.selectionStart || 0);
		terminalState.setActiveSuggestionIndex(0);
		terminalState.setHistoryIndex(-1);
	}, [terminalState]);

	const handleInputSelect = useCallback((e: React.SyntheticEvent<HTMLInputElement>) => {
		terminalState.setCursorPos(e.currentTarget.selectionStart || 0);
	}, [terminalState]);

	const handleContainerClick = useCallback(() => {
		inputRef.current?.focus();
	}, []);

	// Collapsed view
	if (externalIsCollapsed) {
		return (
			<div
				onClick={onToggleCollapse}
				className="h-full flex items-center justify-center bg-transparent cursor-pointer group"
			>
				<div className="flex items-center gap-3 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
					<Terminal className="w-4 h-4" />
					<span className="font-semibold tracking-wide">TERMINAL</span>
					<div className="flex items-center gap-0.5">
						<span className="w-1 h-1 rounded-full bg-current" />
						<span className="w-1 h-1 rounded-full bg-current" />
						<span className="w-1 h-1 rounded-full bg-current" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div
			className="h-full flex flex-col bg-gradient-to-b from-background/98 to-background/95 backdrop-blur-md text-foreground font-mono text-sm overflow-hidden"
			onClick={handleContainerClick}
		>
			<TerminalHeader
				currentPath={terminalState.currentPath}
				historyLength={terminalState.history.length}
				onClearHistory={terminalState.clearHistory}
				onToggleCollapse={onToggleCollapse!}
			/>

			{/* Main Scrollable Container */}
			<div
				ref={scrollRef}
				className="flex-1 min-h-0 overflow-y-auto px-4 py-3 custom-scrollbar space-y-2"
			>
				{/* Welcome message when terminal is empty */}
				{terminalState.history.length === 0 && <TerminalWelcome />}

				{/* Command history */}
				<TerminalOutput history={terminalState.history} />
			</div>

			{/* Input Area */}
			<TerminalInput
				ref={inputRef}
				input={terminalState.input}
				cursorPos={terminalState.cursorPos}
				isFocused={terminalState.isFocused}
				onInputChange={handleInputChange}
				onKeyDown={handleKeyDown}
				onInputSelect={handleInputSelect}
				onFocus={() => terminalState.setIsFocused(true)}
				onBlur={() => terminalState.setIsFocused(false)}
				currentPath={terminalState.currentPath}
			/>

			{/* Suggestions */}
			{terminalState.showSuggestions && (
				<CommandSuggestions
					suggestions={terminalState.suggestions}
					activeSuggestionIndex={terminalState.activeSuggestionIndex}
					onApplySuggestion={terminalState.applySuggestion}
					onSetActiveIndex={terminalState.setActiveSuggestionIndex}
				/>
			)}
		</div>
	);
}
