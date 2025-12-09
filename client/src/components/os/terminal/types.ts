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
	onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
	onKeyDown: (e: React.KeyboardEvent) => void;
	onInputSelect: (e: React.SyntheticEvent<HTMLInputElement>) => void;
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
