import { HistoryItem } from './types';

// State Definition
export interface TerminalState {
	input: string;
	cursorPos: number;
	history: HistoryItem[];
	cmdHistory: string[];
	historyIndex: number;
	currentPath: string;
	isFocused: boolean;
	suggestions: string[];
	activeSuggestionIndex: number;
}

// Action Definitions
export type TerminalAction =
	| { type: 'SET_INPUT'; payload: string }
	| { type: 'SET_CURSOR_POS'; payload: number }
	| { type: 'ADD_HISTORY_ITEM'; payload: HistoryItem }
	| { type: 'CLEAR_HISTORY' }
	| { type: 'SET_CMD_HISTORY'; payload: string[] }
	| { type: 'ADD_CMD_TO_HISTORY'; payload: string }
	| { type: 'SET_HISTORY_INDEX'; payload: number }
	| { type: 'SET_CURRENT_PATH'; payload: string }
	| { type: 'SET_FOCUSED'; payload: boolean }
	| { type: 'SET_SUGGESTIONS'; payload: string[] }
	| { type: 'SET_ACTIVE_SUGGESTION_INDEX'; payload: number }
	| { type: 'RESET_INPUT' };

// Initial State
export const initialTerminalState: TerminalState = {
	input: '',
	cursorPos: 0,
	history: [],
	cmdHistory: [],
	historyIndex: -1,
	currentPath: '~',
	isFocused: false,
	suggestions: [],
	activeSuggestionIndex: 0,
};

// Reducer Function
export function terminalReducer(state: TerminalState, action: TerminalAction): TerminalState {
	switch (action.type) {
		case 'SET_INPUT':
			return { ...state, input: action.payload };
		case 'SET_CURSOR_POS':
			return { ...state, cursorPos: action.payload };
		case 'ADD_HISTORY_ITEM':
			return { ...state, history: [...state.history, action.payload] };
		case 'CLEAR_HISTORY':
			return { ...state, history: [] };
		case 'SET_CMD_HISTORY':
			return { ...state, cmdHistory: action.payload };
		case 'ADD_CMD_TO_HISTORY':
			// Prevent duplicates and limit history is handled before dispatch or here if needed
			// Simple append here for now, assuming logic is in hook/component
			return { ...state, cmdHistory: [...state.cmdHistory, action.payload] };
		case 'SET_HISTORY_INDEX':
			return { ...state, historyIndex: action.payload };
		case 'SET_CURRENT_PATH':
			return { ...state, currentPath: action.payload };
		case 'SET_FOCUSED':
			return { ...state, isFocused: action.payload };
		case 'SET_SUGGESTIONS':
			return { ...state, suggestions: action.payload };
		case 'SET_ACTIVE_SUGGESTION_INDEX':
			return { ...state, activeSuggestionIndex: action.payload };
		case 'RESET_INPUT':
			return {
				...state,
				input: '',
				cursorPos: 0,
				historyIndex: -1,
				activeSuggestionIndex: 0,
				suggestions: [],
			};
		default:
			return state;
	}
}
