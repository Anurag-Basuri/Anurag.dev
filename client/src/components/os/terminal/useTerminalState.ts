import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useAtom } from 'jotai';
import { windowsAtom } from '@/store/atoms';
import { processCommand, getCommandSuggestions } from '@/lib/commands';
import type { CommandResponse } from '@/lib/commands';
import { getModuleComponent } from '@/lib/moduleRegistry';
import { useTheme } from 'next-themes';
import type { HistoryItem } from './types';

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

const saveCommandHistory = (history: string[]): void => {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(CMD_HISTORY_STORAGE_KEY, JSON.stringify(history));
	} catch {
		console.warn('Failed to save command history');
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

const saveCurrentPath = (path: string): void => {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(PATH_STORAGE_KEY, path);
	} catch {
		console.warn('Failed to save path');
	}
};

export function useTerminalState() {
	// State
	const [input, setInput] = useState('');
	const [cursorPos, setCursorPos] = useState(0);
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const [cmdHistory, setCmdHistory] = useState<string[]>(loadCommandHistory);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [currentPath, setCurrentPath] = useState(loadCurrentPath);
	const [isFocused, setIsFocused] = useState(false);
	const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

	// Atoms
	const [, setWindows] = useAtom(windowsAtom);
	const { setTheme, resolvedTheme } = useTheme();

	// Refs for debouncing
	const suggestionsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Computed values
	const normalizedInput = useMemo(() => input.trim().toLowerCase(), [input]);

	// State for debounced suggestions
	const [debouncedSuggestions, setDebouncedSuggestions] = useState<string[]>([]);

	useEffect(() => {
		// Clear existing timeout
		if (suggestionsTimeoutRef.current) {
			clearTimeout(suggestionsTimeoutRef.current);
		}

		suggestionsTimeoutRef.current = setTimeout(() => {
			const result = normalizedInput ? getCommandSuggestions(normalizedInput, 3) : [];
			setDebouncedSuggestions(result);
		}, 150);

		return () => {
			if (suggestionsTimeoutRef.current) {
				clearTimeout(suggestionsTimeoutRef.current);
			}
		};
	}, [normalizedInput]);

	const showSuggestions = isFocused && debouncedSuggestions.length > 0 && input.length > 0;

	// Effects
	useEffect(() => {
		saveCommandHistory(cmdHistory);
	}, [cmdHistory]);

	useEffect(() => {
		saveCurrentPath(currentPath);
	}, [currentPath]);

	// Handlers
	const applySuggestion = useCallback((suggestion: string) => {
		setInput(suggestion);
		setCursorPos(suggestion.length);
		setActiveSuggestionIndex(0);
	}, []);

	const pushCommandToHistory = useCallback((command: string) => {
		setCmdHistory(prev => {
			const filtered = prev.filter(c => c !== command);
			const updated = [...filtered, command];
			return updated.slice(-CMD_HISTORY_LIMIT);
		});
	}, []);

	const addToHistory = useCallback(
		(command: string, response: CommandResponse) => {
			const item: HistoryItem = {
				id: generateHistoryId(),
				command,
				response,
				path: currentPath,
				timestamp: new Date(),
			};
			setHistory(prev => [...prev, item]);
		},
		[currentPath],
	);

	const executeCommand = useCallback(
		async (command: string) => {
			const trimmedCommand = command.trim();
			if (!trimmedCommand) return;

			const response = await processCommand(trimmedCommand, currentPath);

			// Handle different response types
			switch (response.type) {
				case 'clear':
					setHistory([]);
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

			pushCommandToHistory(trimmedCommand);
		},
		[currentPath, addToHistory, pushCommandToHistory, setWindows, setTheme, resolvedTheme],
	);

	const clearHistory = useCallback(() => {
		setHistory([]);
	}, []);

	const resetInput = useCallback(() => {
		setInput('');
		setCursorPos(0);
		setHistoryIndex(-1);
	}, []);

	return {
		// State
		input,
		cursorPos,
		history,
		cmdHistory,
		historyIndex,
		currentPath,
		isFocused,
		activeSuggestionIndex,
		suggestions: debouncedSuggestions,
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