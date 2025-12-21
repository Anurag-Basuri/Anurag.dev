import type { ChangeEvent, KeyboardEvent, SyntheticEvent } from 'react';
import type { CommandResponse } from '@/lib/commands';

export type { CommandResponse };

export interface HistoryItem {
	id: string;
	command: string;
	response: CommandResponse;
	path: string;
	timestamp: Date;
}

export interface TerminalInputProps {
	input: string;
	cursorPos: number;
	isFocused: boolean;
	onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
	onKeyDown: (e: KeyboardEvent) => void;
	onInputSelect: (e: SyntheticEvent<HTMLInputElement>) => void;
	onFocus: () => void;
	onBlur: () => void;
	currentPath: string;
}

export interface CommandSuggestionsProps {
	suggestions: string[];
	activeSuggestionIndex: number;
	onApplySuggestion: (suggestion: string) => void;
	onSetActiveIndex: (index: number) => void;
}
