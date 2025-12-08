'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { processCommand, CommandResponse, getCommandSuggestions } from '@/lib/commands';
import { cn } from '@/lib/utils';
import { useAtom } from 'jotai';
import { windowsAtom } from '@/store/atoms';
import { getModuleComponent } from '@/lib/moduleRegistry';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { ChevronDown, ChevronUp } from 'lucide-react';

type HistoryItem = {
	id: string;
	command: string;
	response: CommandResponse;
	path: string;
	timestamp: Date;
};

const responseTone = (type: CommandResponse['type']): string => {
	switch (type) {
		case 'error':
			return 'text-destructive';
		case 'success':
		case 'open_module':
			return 'text-primary';
		default:
			return 'text-muted-foreground';
	}
};

// Constants
const CMD_HISTORY_STORAGE_KEY = 'anuragos-terminal-cmd-history';
const PATH_STORAGE_KEY = 'anuragos-terminal-path';
const CMD_HISTORY_LIMIT = 100;

const generateHistoryId = (): string =>
	typeof crypto !== 'undefined' && 'randomUUID' in crypto
		? crypto.randomUUID()
		: `${Date.now()}-${Math.random().toString(36).slice(2)}`;

// Utility: Load command history from localStorage
const loadCommandHistory = (): string[] => {
	if (typeof window === 'undefined') return [];
	try {
		const stored = window.localStorage.getItem(CMD_HISTORY_STORAGE_KEY);
		if (!stored) return [];
		const parsed = JSON.parse(stored);
		return Array.isArray(parsed)
			? parsed.filter((entry): entry is string => typeof entry === 'string')
			: [];
	} catch (error) {
		console.warn('Failed to restore terminal history:', error);
		return [];
	}
};

// Utility: Save command history to localStorage
const saveCommandHistory = (history: string[]): void => {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(CMD_HISTORY_STORAGE_KEY, JSON.stringify(history));
	} catch (error) {
		console.warn('Failed to persist command history:', error);
	}
};

// Utility: Load current path from localStorage
const loadCurrentPath = (): string => {
	if (typeof window === 'undefined') return '~';
	try {
		const stored = window.localStorage.getItem(PATH_STORAGE_KEY);
		return stored || '~';
	} catch (error) {
		console.warn('Failed to hydrate terminal path:', error);
		return '~';
	}
};

// Utility: Save current path to localStorage
const saveCurrentPath = (path: string): void => {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(PATH_STORAGE_KEY, path);
	} catch (error) {
		console.warn('Failed to persist terminal path:', error);
	}
};

interface CLIProps {
	onToggleCollapse?: () => void;
}

export function CLI({ onToggleCollapse }: CLIProps) {
	// State
	const [input, setInput] = useState('');
	const [cursorPos, setCursorPos] = useState(0);
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const [cmdHistory, setCmdHistory] = useState<string[]>(loadCommandHistory);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [currentPath, setCurrentPath] = useState(loadCurrentPath);
	const [isFocused, setIsFocused] = useState(false);
	const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
	const [isCollapsed, setIsCollapsed] = useState(false);

	// Refs
	const inputRef = useRef<HTMLInputElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	// Atoms
	const [windows, setWindows] = useAtom(windowsAtom);
	const { setTheme, resolvedTheme } = useTheme();

	// Computed values
	const normalizedInput = input.trim().toLowerCase();
	const suggestions = useMemo(
		() => (normalizedInput ? getCommandSuggestions(normalizedInput, 3) : []),
		[normalizedInput],
	);
	const showSuggestions = isFocused && suggestions.length > 0 && input.length > 0;

	// Effects
	useEffect(() => {
		saveCommandHistory(cmdHistory);
	}, [cmdHistory]);

	useEffect(() => {
		saveCurrentPath(currentPath);
	}, [currentPath]);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [history]);

	// Auto-focus input on mount
	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	// Handlers
	const applySuggestion = useCallback((suggestion: string) => {
		setInput(suggestion);
		setCursorPos(suggestion.length);
		setActiveSuggestionIndex(0);
		setTimeout(() => inputRef.current?.focus(), 0);
	}, []);

	const pushCommandToHistory = useCallback((command: string) => {
		if (!command.trim()) return;
		setCmdHistory(prev => {
			const filtered = prev.filter(cmd => cmd !== command);
			const newHistory = [...filtered, command];
			return newHistory.slice(-CMD_HISTORY_LIMIT);
		});
	}, []);

	const addToHistory = useCallback(
		(command: string, response: CommandResponse) => {
			const newItem: HistoryItem = {
				id: generateHistoryId(),
				command,
				response,
				path: currentPath,
				timestamp: new Date(),
			};
			setHistory(prev => [...prev, newItem]);
		},
		[currentPath],
	);

	const executeCommand = useCallback(
		(command: string) => {
			const trimmedCommand = command.trim();
			if (!trimmedCommand) return;

			const response = processCommand(trimmedCommand, currentPath);

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

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			// Ctrl+L: Clear screen
			if (e.ctrlKey && e.key === 'l') {
				e.preventDefault();
				setHistory([]);
				return;
			}

			// Ctrl+C: Cancel current input
			if (e.ctrlKey && e.key === 'c') {
				e.preventDefault();
				if (input.trim()) {
					addToHistory(input + ' ^C', { type: 'text', content: '' });
				}
				setInput('');
				setCursorPos(0);
				setHistoryIndex(-1);
				return;
			}

			// Ctrl+U: Clear line
			if (e.ctrlKey && e.key === 'u') {
				e.preventDefault();
				setInput('');
				setCursorPos(0);
				return;
			}

			// Enter: Execute command
			if (e.key === 'Enter') {
				e.preventDefault();
				executeCommand(input);
				setInput('');
				setCursorPos(0);
				setHistoryIndex(-1);
				setActiveSuggestionIndex(0);
				return;
			}

			// Tab: Autocomplete
			if (e.key === 'Tab') {
				e.preventDefault();
				if (suggestions.length > 0) {
					applySuggestion(suggestions[activeSuggestionIndex]);
				}
				return;
			}

			// Arrow Up: Previous command
			if (e.key === 'ArrowUp') {
				e.preventDefault();
				if (suggestions.length > 0) {
					setActiveSuggestionIndex(prev => Math.max(0, prev - 1));
				} else if (cmdHistory.length > 0) {
					const newIndex =
						historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
					setHistoryIndex(newIndex);
					const cmd = cmdHistory[newIndex];
					setInput(cmd);
					setCursorPos(cmd.length);
				}
				return;
			}

			// Arrow Down: Next command
			if (e.key === 'ArrowDown') {
				e.preventDefault();
				if (suggestions.length > 0) {
					setActiveSuggestionIndex(prev => Math.min(suggestions.length - 1, prev + 1));
				} else if (historyIndex !== -1) {
					if (historyIndex === cmdHistory.length - 1) {
						setHistoryIndex(-1);
						setInput('');
						setCursorPos(0);
					} else {
						const newIndex = Math.min(cmdHistory.length - 1, historyIndex + 1);
						setHistoryIndex(newIndex);
						const cmd = cmdHistory[newIndex];
						setInput(cmd);
						setCursorPos(cmd.length);
					}
				}
				return;
			}
		},
		[
			input,
			suggestions,
			activeSuggestionIndex,
			cmdHistory,
			historyIndex,
			executeCommand,
			applySuggestion,
			addToHistory,
		],
	);

	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		setInput(e.target.value);
		setCursorPos(e.target.selectionStart || 0);
		setActiveSuggestionIndex(0);
		setHistoryIndex(-1);
	}, []);

	const handleInputSelect = useCallback((e: React.SyntheticEvent<HTMLInputElement>) => {
		setCursorPos(e.currentTarget.selectionStart || 0);
	}, []);

	const handleContainerClick = useCallback(() => {
		inputRef.current?.focus();
	}, []);

	const handleToggleCollapse = useCallback(() => {
		setIsCollapsed(!isCollapsed);
		onToggleCollapse?.();
	}, [isCollapsed, onToggleCollapse]);

	const getPromptLabel = useCallback(
		(path: string) => (
			<span className="font-medium select-none">
				<span className="text-green-500">root@anuragos</span>
				<span className="text-muted-foreground">:</span>
				<span className="text-blue-500">{path}</span>
				<span className="text-muted-foreground">$</span>
			</span>
		),
		[],
	);

	return (
		<div
			className="h-full flex flex-col bg-background/95 backdrop-blur-sm text-foreground font-mono text-sm overflow-hidden"
			onClick={handleContainerClick}
		>
			{/* Simple Header */}
			<div className="px-3 py-2 border-b border-border/50 bg-background/65 backdrop-blur-md flex items-center justify-between shrink-0">
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<span className="font-semibold">TERMINAL</span>
					<span className="text-[10px]">{currentPath}</span>
				</div>
				<button
					type="button"
					onClick={handleToggleCollapse}
					className="p-1 hover:bg-accent rounded transition-colors"
					aria-label="Toggle terminal"
				>
					{isCollapsed ? (
						<ChevronUp className="w-3.5 h-3.5" />
					) : (
						<ChevronDown className="w-3.5 h-3.5" />
					)}
				</button>
			</div>

			{/* Main Scrollable Container */}
			<div
				ref={scrollRef}
				className="flex-1 min-h-0 overflow-y-auto px-3 py-3 custom-scrollbar space-y-2"
			>
				{/* Welcome message when terminal is empty */}
				{history.length === 0 && (
					<div className="select-none text-xs text-muted-foreground space-y-1 pb-2">
						<div className="text-primary font-semibold">AnuragOS Terminal</div>
						<div>
							Type{' '}
							<code className="text-primary bg-primary/10 px-1 rounded">help</code>{' '}
							for commands
						</div>
					</div>
				)}

				{/* Command history */}
				<div className="space-y-2">
					<AnimatePresence initial={false} mode="popLayout">
						{history.map(item => (
							<motion.div
								key={item.id}
								layout
								initial={{ opacity: 0, y: 8 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -4 }}
								transition={{ duration: 0.15, ease: 'easeOut' }}
								className="space-y-1"
							>
								<div className="flex gap-2 text-sm items-baseline">
									<span className="shrink-0">{getPromptLabel(item.path)}</span>
									<span className="flex-1 break-all">{item.command}</span>
								</div>
								{item.response.content && (
									<div
										className={cn(
											'pl-3 text-xs whitespace-pre-wrap',
											responseTone(item.response.type),
										)}
									>
										{item.response.content}
									</div>
								)}
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</div>

			{/* Input Area */}
			<div className="px-3 py-2 border-t border-border/40 bg-background/60 shrink-0 space-y-2">
				<div className="flex items-start gap-2 text-sm">
					<span className="shrink-0 mt-1">{getPromptLabel(currentPath)}</span>
					<div className="relative flex-1 min-w-0">
						<div className="bg-background/60 px-2 py-1 rounded-md border border-border/50 shadow-inner">
							{/* Hidden input for text capture */}
							<input
								ref={inputRef}
								type="text"
								value={input}
								onChange={handleInputChange}
								onKeyDown={handleKeyDown}
								onSelect={handleInputSelect}
								onFocus={() => setIsFocused(true)}
								onBlur={() => setIsFocused(false)}
								className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-transparent outline-none px-2 py-1"
								autoComplete="off"
								autoCorrect="off"
								autoCapitalize="off"
								spellCheck="false"
								aria-label="Terminal input"
							/>
							{/* Visible input display */}
							<div className="whitespace-pre-wrap break-all min-h-[1rem]">
								<span>{input.substring(0, cursorPos)}</span>
								<span
									className={cn(
										'inline-block w-1.5 h-3.5 -mb-0.5',
										isFocused
											? 'bg-foreground animate-pulse'
											: 'bg-transparent',
									)}
									aria-hidden="true"
								/>
								<span>{input.substring(cursorPos)}</span>
							</div>
						</div>
					</div>
				</div>

				{/* Suggestions - only show when typing */}
				{showSuggestions && (
					<div className="flex flex-wrap gap-1.5 text-xs">
						{suggestions.map((suggestion, idx) => (
							<button
								key={`${suggestion}-${idx}`}
								type="button"
								tabIndex={-1}
								onMouseDown={e => e.preventDefault()}
								onClick={e => {
									e.stopPropagation();
									applySuggestion(suggestion);
								}}
								className={cn(
									'px-2 py-0.5 rounded border transition-colors',
									idx === activeSuggestionIndex
										? 'border-primary text-primary bg-primary/10'
										: 'border-border/40 hover:border-border',
								)}
								aria-label={`Suggestion: ${suggestion}`}
							>
								{suggestion}
							</button>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
