'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { processCommand, CommandResponse, getCommandSuggestions } from '@/lib/commands';
import { cn } from '@/lib/utils';
import { useAtom } from 'jotai';
import { windowsAtom } from '@/store/atoms';
import { getModuleComponent } from '@/lib/moduleRegistry';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';

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
		case 'component':
			return 'text-muted-foreground';
		default:
			return 'text-muted-foreground';
	}
};

// Constants
const CMD_HISTORY_STORAGE_KEY = 'anuragos-terminal-cmd-history';
const PATH_STORAGE_KEY = 'anuragos-terminal-path';
const CMD_HISTORY_LIMIT = 100;
const QUICK_COMMANDS = ['help', 'about', 'projects', 'contact'] as const;

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

export function CLI() {
	// State
	const [input, setInput] = useState('');
	const [cursorPos, setCursorPos] = useState(0);
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const [cmdHistory, setCmdHistory] = useState<string[]>(loadCommandHistory);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [currentPath, setCurrentPath] = useState(loadCurrentPath);
	const [isFocused, setIsFocused] = useState(false);
	const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

	// Refs
	const inputRef = useRef<HTMLInputElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	// Atoms
	const [windows, setWindows] = useAtom(windowsAtom);
	const { setTheme, resolvedTheme } = useTheme();

	// Computed values
	const normalizedInput = input.trim().toLowerCase();
	const suggestions = useMemo(
		() => (normalizedInput ? getCommandSuggestions(normalizedInput, 5) : []),
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

	const handleQuickCommand = useCallback((cmd: string) => {
		setInput(cmd);
		setCursorPos(cmd.length);
		setTimeout(() => inputRef.current?.focus(), 0);
	}, []);

	const handleClear = useCallback(() => {
		setHistory([]);
		setCmdHistory([]);
		if (typeof window !== 'undefined') {
			window.localStorage.removeItem(CMD_HISTORY_STORAGE_KEY);
		}
	}, []);

	const getPromptLabel = useCallback(
		(path: string) => (
			<span className="font-medium select-none">
				<span className="text-green-500">root@anuragos</span>
				<span className="text-muted-foreground">:</span>
				<span className="text-blue-500">{path}</span>
				<span className="text-muted-foreground">#</span>
			</span>
		),
		[],
	);

	return (
		<div
			className="h-full flex flex-col bg-terminal-bg text-terminal-text font-mono text-sm overflow-hidden transition-colors duration-300 relative rounded-xl"
			onClick={handleContainerClick}
		>
			{/* Ambient gradient overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-[0.06] pointer-events-none" />

			{/* Terminal Toolbar */}
			<div className="px-4 py-3 border-b border-border/30 bg-background/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs relative z-10 shrink-0">
				<div className="flex items-center gap-3 text-muted-foreground">
					<div className="flex items-center gap-1.5" aria-label="Window controls">
						<span className="w-2.5 h-2.5 rounded-full bg-destructive/70 shadow-[0_0_0_4px_rgba(239,68,68,0.15)]" />
						<span className="w-2.5 h-2.5 rounded-full bg-amber-400/70 shadow-[0_0_0_4px_rgba(251,191,36,0.12)]" />
						<span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" />
					</div>
					<span className="text-[11px] tracking-[0.28em] uppercase">Terminal</span>
					<span className="hidden sm:inline px-2 py-0.5 rounded-full border border-border/60 text-[10px]">
						Ctrl+L clear
					</span>
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					{QUICK_COMMANDS.map(cmd => (
						<button
							key={cmd}
							type="button"
							className="px-2 py-1 rounded border border-border/60 bg-background/70 hover:bg-primary/10 hover:border-primary/40 transition-colors text-[11px]"
							onClick={e => {
								e.stopPropagation();
								handleQuickCommand(cmd);
							}}
							aria-label={`Quick command: ${cmd}`}
						>
							{cmd}
						</button>
					))}
					<button
						type="button"
						className="px-2 py-1 rounded border border-border/60 bg-background/70 hover:bg-destructive/10 hover:border-destructive/50 transition-colors text-destructive text-[11px]"
						onClick={e => {
							e.stopPropagation();
							handleClear();
						}}
						aria-label="Clear terminal"
					>
						Clear
					</button>
				</div>
			</div>

			{/* Status strip */}
			<div className="px-4 py-2 border-b border-border/20 bg-background/60 backdrop-blur-sm text-[11px] flex flex-wrap items-center justify-between gap-2 relative z-10 shrink-0">
				<div className="flex items-center gap-2 text-muted-foreground">
					<span className="px-2 py-1 rounded-md border border-border/50 bg-background/60 text-foreground/90">
						<span className="hidden sm:inline">Path: </span>
						{currentPath}
					</span>
					<span className="hidden sm:inline px-2 py-1 rounded-md border border-border/50 bg-background/60">
						Theme: {resolvedTheme ?? 'system'}
					</span>
				</div>
				<div className="flex items-center gap-2 text-muted-foreground">
					<span className="px-2 py-1 rounded-md border border-border/50 bg-background/60">
						History: {history.length}
					</span>
					{suggestions.length > 0 && (
						<span className="px-2 py-1 rounded-md border border-primary/50 bg-primary/10 text-primary">
							{suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''}
						</span>
					)}
				</div>
			</div>

			{/* Main Scrollable Container */}
			<div
				ref={scrollRef}
				className="flex-1 min-h-0 overflow-y-auto px-4 py-4 custom-scrollbar space-y-4 relative z-10"
			>
				{/* Welcome message when terminal is empty */}
				{history.length === 0 && (
					<div className="select-none mb-2 pb-3 border-b border-border/20">
						<div className="text-primary font-semibold text-sm mb-1.5">
							$ AnuragOS Terminal v1.0.0
						</div>
						<div className="text-xs text-muted-foreground/70 space-y-1">
							<div>
								Type{' '}
								<code className="text-primary bg-primary/10 px-1 py-0.5 rounded text-[10px]">
									help
								</code>{' '}
								for available commands, or click files in Explorer.
							</div>
							<div className="text-[10px] mt-2">
								Shortcuts: Tab (autocomplete) • ↑/↓ (history) • Ctrl+L (clear) •
								Ctrl+C (cancel)
							</div>
						</div>
					</div>
				)}

				{/* Command history */}
				<div className="space-y-3 pb-4">
					<AnimatePresence initial={false} mode="popLayout">
						{history.map(item => (
							<motion.div
								key={item.id}
								layout
								initial={{ opacity: 0, y: 12 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -8 }}
								transition={{ duration: 0.18, ease: 'easeOut' }}
								className="rounded-xl border border-border/30 bg-background/50 backdrop-blur-sm shadow-[0_12px_45px_-28px_rgba(0,0,0,0.6)] p-3"
							>
								<div className="flex gap-2 text-sm items-baseline flex-wrap">
									<span className="text-glow shrink-0">
										{getPromptLabel(item.path)}
									</span>
									<span className="flex-1 break-all">{item.command}</span>
								</div>
								{item.response.content && (
									<div
										className={cn(
											'mt-2 pl-3 border-l-2 border-border/40 whitespace-pre-wrap leading-relaxed text-[13px]',
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
			<div className="px-4 pb-4 pt-3 border-t border-border/20 bg-background/70 backdrop-blur-sm relative z-10 shrink-0">
				<div className="flex items-start gap-3 text-sm">
					<span className="text-glow shrink-0 mt-1">{getPromptLabel(currentPath)}</span>
					<div className="relative flex-1 min-w-[140px]">
						<div className="rounded-lg border border-border/50 bg-background/60 px-3 py-2 shadow-inner">
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
								className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-transparent outline-none px-3 py-2"
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
										'inline-block w-2 h-4 -mb-1',
										isFocused
											? 'bg-terminal-text animate-pulse'
											: 'bg-transparent',
									)}
									aria-hidden="true"
								/>
								<span>{input.substring(cursorPos)}</span>
							</div>
						</div>
					</div>
				</div>

				{/* Suggestions and helpers */}
				<div
					className={cn(
						'mt-3 transition-opacity duration-150 space-y-2',
						showSuggestions ? 'opacity-100' : 'opacity-75',
					)}
				>
					{/* Suggestions */}
					<div className="flex flex-wrap gap-2 items-center text-xs">
						<span className="text-muted-foreground font-medium">Suggestions:</span>
						{suggestions.length === 0 ? (
							<span className="text-muted-foreground/70">
								Start typing for autocomplete
							</span>
						) : (
							suggestions.map((suggestion, idx) => (
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
										'px-2 py-0.5 rounded border transition-colors bg-background/50',
										idx === activeSuggestionIndex
											? 'border-primary/70 text-primary bg-primary/10'
											: 'border-border/40 hover:border-border/70',
									)}
									aria-label={`Suggestion: ${suggestion}`}
								>
									{suggestion}
								</button>
							))
						)}
					</div>

					{/* Keyboard shortcuts */}
					<div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
						<span className="px-2 py-1 rounded border border-border/40 bg-muted/30">
							<kbd className="font-mono">Tab</kbd> autocomplete
						</span>
						<span className="px-2 py-1 rounded border border-border/40 bg-muted/30">
							<kbd className="font-mono">↑/↓</kbd> history
						</span>
						<span className="px-2 py-1 rounded border border-border/40 bg-muted/30">
							<kbd className="font-mono">Ctrl+C</kbd> cancel
						</span>
						<span className="px-2 py-1 rounded border border-border/40 bg-muted/30">
							<kbd className="font-mono">Ctrl+L</kbd> clear
						</span>
						<span className="px-2 py-1 rounded border border-border/40 bg-muted/30">
							<kbd className="font-mono">Ctrl+U</kbd> clear line
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
