'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useAtom } from 'jotai';
import { windowsAtom } from '@/store/atoms';
import { processCommand, getCommandSuggestions } from '@/lib/commands';
import type { CommandResponse } from '@/lib/commands';
import { getModuleComponent } from '@/lib/moduleRegistry';
import { useTheme } from 'next-themes';
import { ChevronUp, ChevronDown, Terminal, Maximize2, Minimize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

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
			return 'text-red-400';
		case 'success':
			return 'text-emerald-400';
		case 'text':
			return 'text-foreground/90';
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
		const raw = window.localStorage.getItem(CMD_HISTORY_STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed.slice(-CMD_HISTORY_LIMIT) : [];
	} catch (error) {
		return [];
	}
};

// Utility: Save command history to localStorage
const saveCommandHistory = (history: string[]): void => {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(CMD_HISTORY_STORAGE_KEY, JSON.stringify(history));
	} catch (error) {
		console.warn('Failed to save command history', error);
	}
};

// Utility: Load current path from localStorage
const loadCurrentPath = (): string => {
	if (typeof window === 'undefined') return '~';
	try {
		return window.localStorage.getItem(PATH_STORAGE_KEY) || '~';
	} catch (error) {
		return '~';
	}
};

// Utility: Save current path to localStorage
const saveCurrentPath = (path: string): void => {
	if (typeof window === 'undefined') return;
	try {
		window.localStorage.setItem(PATH_STORAGE_KEY, path);
	} catch (error) {
		console.warn('Failed to save path', error);
	}
};

interface CLIProps {
	onToggleCollapse?: () => void;
	isCollapsed?: boolean;
}

export function CLI({ onToggleCollapse, isCollapsed: externalIsCollapsed }: CLIProps) {
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
		inputRef.current?.focus();
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

			// Ctrl+C: Clear input
			if (e.ctrlKey && e.key === 'c') {
				e.preventDefault();
				setInput('');
				setCursorPos(0);
				setHistoryIndex(-1);
				addToHistory(input, { type: 'error', content: '^C' });
				return;
			}

			// Enter: Execute command
			if (e.key === 'Enter') {
				e.preventDefault();
				if (suggestions.length > 0 && activeSuggestionIndex >= 0) {
					applySuggestion(suggestions[activeSuggestionIndex]);
				} else {
					executeCommand(input);
					setInput('');
					setCursorPos(0);
					setHistoryIndex(-1);
				}
				return;
			}

			// Tab: Apply first suggestion
			if (e.key === 'Tab') {
				e.preventDefault();
				if (suggestions.length > 0) {
					applySuggestion(suggestions[activeSuggestionIndex]);
				}
				return;
			}

			// Arrow Up: Previous command or navigate suggestions
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

	const handleClearHistory = useCallback(() => {
		setHistory([]);
	}, []);

	const getPromptLabel = useCallback(
		(path: string) => (
			<span className="font-medium select-none">
				<span className="text-emerald-500 dark:text-emerald-400">root@anuragos</span>
				<span className="text-muted-foreground">:</span>
				<span className="text-sky-500 dark:text-sky-400">{path}</span>
				<span className="text-primary">$</span>
			</span>
		),
		[],
	);

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
			{/* Enhanced Header */}
			<div className="px-4 py-2.5 border-b border-border/60 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 backdrop-blur-sm flex items-center justify-between shrink-0 shadow-sm">
				<div className="flex items-center gap-3">
					<div className="flex items-center gap-2 text-xs">
						<Terminal className="w-4 h-4 text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.4)]" />
						<span className="font-bold tracking-wide text-foreground">TERMINAL</span>
					</div>
					<div className="h-4 w-px bg-border/50" />
					<div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
						<span className="opacity-70">Path:</span>
						<code className="px-1.5 py-0.5 bg-muted/40 rounded text-primary font-medium">
							{currentPath}
						</code>
					</div>
				</div>

				<div className="flex items-center gap-1">
					{history.length > 0 && (
						<button
							type="button"
							onClick={handleClearHistory}
							className="p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-md transition-all duration-200 group"
							aria-label="Clear terminal"
							title="Clear terminal"
						>
							<X className="w-3.5 h-3.5" />
						</button>
					)}
					<button
						type="button"
						onClick={onToggleCollapse}
						className="p-1.5 hover:bg-muted/60 rounded-md transition-all duration-200 group"
						aria-label="Toggle terminal"
						title="Collapse terminal"
					>
						<ChevronDown className="w-3.5 h-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
					</button>
				</div>
			</div>

			{/* Main Scrollable Container */}
			<div
				ref={scrollRef}
				className="flex-1 min-h-0 overflow-y-auto px-4 py-3 custom-scrollbar space-y-2"
			>
				{/* Welcome message when terminal is empty */}
				{history.length === 0 && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="select-none text-xs space-y-2 pb-2"
					>
						<div className="flex items-center gap-2">
							<Terminal className="w-5 h-5 text-primary" />
							<span className="text-primary font-bold text-sm">
								AnuragOS Terminal v1.0
							</span>
						</div>
						<div className="text-muted-foreground space-y-1 pl-7">
							<div>
								Type{' '}
								<code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded font-semibold">
									help
								</code>{' '}
								to see available commands
							</div>
							<div className="text-[10px] opacity-70">
								Pro tip: Use <kbd className="kbd">↑</kbd> /{' '}
								<kbd className="kbd">↓</kbd> for history,{' '}
								<kbd className="kbd">Tab</kbd> to autocomplete
							</div>
						</div>
					</motion.div>
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
									<span className="flex-1 break-all text-foreground/90">
										{item.command}
									</span>
								</div>
								{item.response.content && (
									<div
										className={cn(
											'pl-3 text-xs whitespace-pre-wrap leading-relaxed',
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
			<div className="px-4 py-2.5 border-t border-border/50 bg-gradient-to-t from-muted/20 to-transparent backdrop-blur-sm shrink-0 space-y-2">
				<div className="flex items-start gap-2 text-sm">
					<span className="shrink-0 mt-1">{getPromptLabel(currentPath)}</span>
					<div className="relative flex-1 min-w-0">
						<div className="bg-muted/30 px-2.5 py-1.5 rounded-lg border border-border/60 shadow-inner backdrop-blur-sm hover:border-border/80 focus-within:border-primary/50 focus-within:bg-muted/40 transition-all duration-200">
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
								className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-transparent outline-none px-2.5 py-1.5"
								autoComplete="off"
								autoCorrect="off"
								autoCapitalize="off"
								spellCheck="false"
								aria-label="Terminal input"
							/>
							{/* Visible input display */}
							<div className="whitespace-pre-wrap break-all min-h-[1.25rem] text-foreground">
								<span>{input.substring(0, cursorPos)}</span>
								<span
									className={cn(
										'inline-block w-2 h-4 -mb-0.5 rounded-sm',
										isFocused
											? 'bg-primary/80 shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)] animate-pulse'
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
					<motion.div
						initial={{ opacity: 0, y: -4 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -4 }}
						className="flex flex-wrap gap-1.5 text-xs pl-2"
					>
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
									'px-2.5 py-1 rounded-md border transition-all duration-200 font-medium',
									idx === activeSuggestionIndex
										? 'border-primary/60 text-primary bg-primary/15 shadow-[0_0_8px_rgba(var(--primary-rgb),0.2)]'
										: 'border-border/50 hover:border-border/80 text-muted-foreground hover:text-foreground bg-background/40 hover:bg-muted/40',
								)}
								aria-label={`Suggestion: ${suggestion}`}
							>
								{suggestion}
							</button>
						))}
					</motion.div>
				)}
			</div>
		</div>
	);
}
