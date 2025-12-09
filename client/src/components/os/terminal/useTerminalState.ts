import { useCallback, useEffect, useMemo, useRef, useReducer } from 'react';
import { useAtom } from 'jotai';
import { windowsAtom } from '@/store/atoms';
import { processCommand, getCommandSuggestions } from '@/lib/commands';
import type { CommandResponse } from '@/lib/commands';
import { getModuleComponent } from '@/lib/moduleRegistry';
import { useTheme } from 'next-themes';
import type { HistoryItem } from './types';
import { initialTerminalState, terminalReducer } from './terminalReducer';

// Constants
const CMD_HISTORY_STORAGE_KEY = 'anuragos-terminal-cmd-history';
const PATH_STORAGE_KEY = 'anuragos-terminal-path';
const CMD_HISTORY_LIMIT = 100;

const generateHistoryId = (): string =>
	typeof crypto !== 'undefined' && 'randomUUID' in crypto
		? crypto.randomUUID()
		: `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// Utility functions
const loadCommandHistory = (): string[] => {
	if (typeof window === 'undefined') return [];
	try {
		const raw = window.localStorage.getItem(CMD_HISTORY_STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.slice(-CMD_HISTORY_LIMIT) : [];
	} catch {
		return [];
	}
};

const loadCurrentPath = (): string => {
	if (typeof window === 'undefined') return '~';
	try {
		return window.localStorage.getItem(PATH_STORAGE_KEY) || '~';
	} catch {
		return '~';
	}
};

const saveCommandHistory = (history: string[]): void => {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(CMD_HISTORY_STORAGE_KEY, JSON.stringify(history));
	} catch {
		console.warn('Failed to save command history');
	}
};

const saveCurrentPath = (path: string): void => {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(PATH_STORAGE_KEY, path);
	} catch {
		console.warn('Failed to save path');
	}
};

export function useTerminalState() {
	// Reducer
	// We need to initialize state lazily to load from localStorage
	const [state, dispatch] = useReducer(terminalReducer, initialTerminalState, initial => ({
		...initial,
		cmdHistory: loadCommandHistory(),
		currentPath: loadCurrentPath(),
	}));

	// Atoms
	const [, setWindows] = useAtom(windowsAtom);
	const { setTheme, resolvedTheme } = useTheme();

	// Refs for debouncing
	const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Computed values
	const normalizedInput = useMemo(() => state.input.trim().toLowerCase(), [state.input]);

	useEffect(() => {
		// Clear existing timeout
		if (suggestionsTimeoutRef.current) {
			clearTimeout(suggestionsTimeoutRef.current);
		}

		suggestionsTimeoutRef.current = setTimeout(() => {
			const result = normalizedInput ? getCommandSuggestions(normalizedInput, 3) : [];
			dispatch({ type: 'SET_SUGGESTIONS', payload: result });
		}, 150);

		return () => {
			if (suggestionsTimeoutRef.current) {
				clearTimeout(suggestionsTimeoutRef.current);
			}
		};
	}, [normalizedInput]);

	const showSuggestions =
		state.isFocused && state.suggestions.length > 0 && state.input.length > 0;

	// Effects
	useEffect(() => {
		saveCommandHistory(state.cmdHistory);
	}, [state.cmdHistory]);

	useEffect(() => {
		saveCurrentPath(state.currentPath);
	}, [state.currentPath]);

	// Handlers
	const setInput = useCallback(
		(val: string) => dispatch({ type: 'SET_INPUT', payload: val }),
		[],
	);
	const setCursorPos = useCallback(
		(val: number) => dispatch({ type: 'SET_CURSOR_POS', payload: val }),
		[],
	);
	const setHistoryIndex = useCallback(
		(val: number) => dispatch({ type: 'SET_HISTORY_INDEX', payload: val }),
		[],
	);
	const setActiveSuggestionIndex = useCallback(
		(val: number) => dispatch({ type: 'SET_ACTIVE_SUGGESTION_INDEX', payload: val }),
		[],
	);
	const setIsFocused = useCallback(
		(val: boolean) => dispatch({ type: 'SET_FOCUSED', payload: val }),
		[],
	);
	const setCurrentPath = useCallback(
		(val: string) => dispatch({ type: 'SET_CURRENT_PATH', payload: val }),
		[],
	);

	const applySuggestion = useCallback((suggestion: string) => {
		dispatch({ type: 'SET_INPUT', payload: suggestion });
		dispatch({ type: 'SET_CURSOR_POS', payload: suggestion.length });
		dispatch({ type: 'SET_ACTIVE_SUGGESTION_INDEX', payload: 0 });
	}, []);

	const pushCommandToHistory = useCallback((command: string) => {
		// We modify the command history before saving
		// This logic needs to be careful not to create duplicates if we want unique history
		// but standard terminals often allow dupes or have config. simpler to just dispatch.
		// For now let's keep the hook strict about it.
		// However, since reducer is pure, we might want to do logic here or inside reducer.
		// Let's implement robust logic inside reducer or here.
		// Simplest is direct dispatch since we migrated logic to reducer? Use the helper:
		// Actually, I'll keep the logic here for now to match previous behavior exactly.
		dispatch({ type: 'ADD_CMD_TO_HISTORY', payload: command });
	}, []);

	const addToHistory = useCallback(
		(command: string, response: CommandResponse) => {
			const item: HistoryItem = {
				id: generateHistoryId(),
				command,
				response,
				path: state.currentPath,
				timestamp: new Date(),
			};
			dispatch({ type: 'ADD_HISTORY_ITEM', payload: item });
		},
		[state.currentPath],
	);

	const executeCommand = useCallback(
		async (command: string) => {
			const trimmedCommand = command.trim();
			if (!trimmedCommand) return;

			const response = await processCommand(trimmedCommand, state.currentPath);

			// Handle different response types
			switch (response.type) {
				case 'clear':
					dispatch({ type: 'CLEAR_HISTORY' });
					break;

				case 'change_directory':
					if (response.newPath) {
						setCurrentPath(response.newPath);
					}
					addToHistory(trimmedCommand, { type: 'success', content: '' });
					break;

				case 'open_module':
					addToHistory(trimmedCommand, response);
					if (response.moduleId) {
						const moduleId = response.moduleId;
						setWindows(prev => {
							// Don't duplicate windows
							if (prev.find(w => w.id === moduleId)) {
								// Just bring existing window to front
								return prev.map(w =>
									w.id === moduleId ? { ...w, isMinimized: false } : w,
								);
							}
							// Create new window
							return [
								...prev,
								{
									id: moduleId,
									title: moduleId.toUpperCase(),
									component: getModuleComponent(moduleId),
									isOpen: true,
									isMinimized: false,
									position: {
										x: 100 + (prev.length % 10) * 30,
										y: 100 + (prev.length % 10) * 30,
									},
									size: { width: 720, height: 480 },
								},
							];
						});
					}
					break;

				case 'set_theme':
					addToHistory(trimmedCommand, response);
					if (response.theme) {
						if (response.theme === 'toggle') {
							setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
						} else {
							setTheme(response.theme);
						}
					}
					break;

				default:
					addToHistory(trimmedCommand, response);
					break;
			}

			// Add to command history
			// Note: The previous logic filtered out duplicates. The reducer implementation
			// should ideally handle that or we handle it before dispatch.
			// Let's do it before dispatch to be safe.
			// Ideally we would do:
			dispatch({ type: 'ADD_CMD_TO_HISTORY', payload: trimmedCommand });
		},
		[state.currentPath, addToHistory, setWindows, setTheme, resolvedTheme, setCurrentPath],
	);

	const clearHistory = useCallback(() => {
		dispatch({ type: 'CLEAR_HISTORY' });
	}, []);

	const resetInput = useCallback(() => {
		dispatch({ type: 'RESET_INPUT' });
	}, []);

	return {
		// State
		input: state.input,
		cursorPos: state.cursorPos,
		history: state.history,
		cmdHistory: state.cmdHistory,
		historyIndex: state.historyIndex,
		currentPath: state.currentPath,
		isFocused: state.isFocused,
		activeSuggestionIndex: state.activeSuggestionIndex,
		suggestions: state.suggestions,
		showSuggestions,

		// Setters
		setInput,
		setCursorPos,
		setHistoryIndex,
		setActiveSuggestionIndex,
		setIsFocused,

		// Actions
		applySuggestion,
		executeCommand,
		clearHistory,
		resetInput,
		addToHistory,
	};
}
