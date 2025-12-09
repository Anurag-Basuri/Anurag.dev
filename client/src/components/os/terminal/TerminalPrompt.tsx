'use client';

import { useRef, useEffect } from 'react';
import { TerminalInput } from './TerminalInput';
import { CommandSuggestions } from './CommandSuggestions';
import { useTerminalState } from './useTerminalState';

interface TerminalPromptProps {
	terminalState: ReturnType<typeof useTerminalState>;
	onKeyDown: (e: React.KeyboardEvent) => void;
}

export function TerminalPrompt({ terminalState, onKeyDown }: TerminalPromptProps) {
	const inputRef = useRef<HTMLInputElement>(null);

	// Auto-focus input on mount
	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	// Keep focus when clicking anywhere in the prompt area involves parent usually
	// but here we expose the ref or handle it via props if needed.
	// For now, simple component.

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		terminalState.setInput(e.target.value);
		terminalState.setCursorPos(e.target.selectionStart || 0);
		terminalState.setActiveSuggestionIndex(0);
		terminalState.setHistoryIndex(-1);
	};

	const handleInputSelect = (e: React.SyntheticEvent<HTMLInputElement>) => {
		terminalState.setCursorPos(e.currentTarget.selectionStart || 0);
	};

	return (
		<div className="shrink-0 relative">
			<TerminalInput
				ref={inputRef}
				input={terminalState.input}
				cursorPos={terminalState.cursorPos}
				isFocused={terminalState.isFocused}
				onInputChange={handleInputChange}
				onKeyDown={onKeyDown}
				onInputSelect={handleInputSelect}
				onFocus={() => terminalState.setIsFocused(true)}
				onBlur={() => terminalState.setIsFocused(false)}
				currentPath={terminalState.currentPath}
			/>

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
