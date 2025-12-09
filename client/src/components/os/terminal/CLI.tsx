'use client';

import { useRef, useCallback, useEffect } from 'react';
import { TerminalHeader } from './TerminalHeader';
import { TerminalInput } from './TerminalInput';
import { TerminalOutput } from './TerminalOutput';
import { TerminalWelcome } from './TerminalWelcome';
import { CommandSuggestions } from './CommandSuggestions';
import { useTerminalState } from './useTerminalState';
import { ChevronUp, Terminal as TerminalIcon, MoreHorizontal } from 'lucide-react';

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

	const handleInputChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			terminalState.setInput(e.target.value);
			terminalState.setCursorPos(e.target.selectionStart || 0);
			terminalState.setActiveSuggestionIndex(0);
			terminalState.setHistoryIndex(-1);
		},
		[terminalState],
	);

	const handleInputSelect = useCallback(
		(e: React.SyntheticEvent<HTMLInputElement>) => {
			terminalState.setCursorPos(e.currentTarget.selectionStart || 0);
		},
		[terminalState],
	);

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
				{terminalState.history.length === 0 && <TerminalWelcome />}
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
