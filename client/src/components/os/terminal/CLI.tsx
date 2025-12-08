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
};

const responseTone = (type: CommandResponse['type']) => {
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

const CMD_HISTORY_STORAGE_KEY = 'anuragos-terminal-cmd-history';
const PATH_STORAGE_KEY = 'anuragos-terminal-path';
const CMD_HISTORY_LIMIT = 50;
const QUICK_COMMANDS = ['help', 'about', 'projects', 'contact'];

const generateHistoryId = () =>
	typeof crypto !== 'undefined' && 'randomUUID' in crypto
		? crypto.randomUUID()
		: Math.random().toString(36).slice(2);

export function CLI() {
	const [input, setInput] = useState('');
	const [cursorPos, setCursorPos] = useState(0);
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const [cmdHistory, setCmdHistory] = useState<string[]>(() => {
		if (typeof window === 'undefined') return [];
		try {
			const storedHistory = window.localStorage.getItem(CMD_HISTORY_STORAGE_KEY);
			let filteredHistory: string[] = [];
			if (storedHistory) {
				const parsed = JSON.parse(storedHistory);
				if (Array.isArray(parsed)) {
					filteredHistory = parsed.filter(
						(entry): entry is string => typeof entry === 'string',
					);
				}
			}
			return filteredHistory;
		} catch (error) {
			console.warn('Failed to restore terminal history', error);
			return [];
		}
	});
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [currentPath, setCurrentPath] = useState(() => {
		if (typeof window !== 'undefined') {
			try {
				const storedPath = window.localStorage.getItem(PATH_STORAGE_KEY);
				if (storedPath) return storedPath;
			} catch (error) {
				console.warn('Failed to hydrate terminal state', error);
			}
		}
		return '~';
	});
	const inputRef = useRef<HTMLInputElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const [windows, setWindows] = useAtom(windowsAtom);
	const { setTheme, resolvedTheme } = useTheme();
	const [isFocused, setIsFocused] = useState(false);
	const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

	const normalizedInput = input.trim().toLowerCase();
	const suggestions = useMemo(
		() => (normalizedInput ? getCommandSuggestions(normalizedInput, 5) : []),
		[normalizedInput],
	);

	const applySuggestion = useCallback((suggestion: string) => {
		setInput(suggestion);
		setCursorPos(suggestion.length);
		setActiveSuggestionIndex(0);
	}, []);

	const pushCommandToHistory = useCallback((value: string) => {
		if (!value) return;
		setCmdHistory(prev => {
			const newHistory = [...prev.filter(v => v !== value), value];
			return newHistory.slice(-CMD_HISTORY_LIMIT);
		});
	}, []);

	useEffect(() => {
		if (typeof window === 'undefined') return;
		try {
			window.localStorage.setItem(PATH_STORAGE_KEY, currentPath);
		} catch (error) {
			console.warn('Failed to persist terminal path', error);
		}
	}, [currentPath]);

	const getPromptLabel = (path: string) => (
		<span className="font-medium">
			<span className="text-green-500">root@anuragos</span>
			<span className="text-muted-foreground">:</span>
			<span className="text-blue-500">{path}</span>
			<span className="text-muted-foreground">#</span>
		</span>
	);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		// Handle Ctrl+L (Clear Screen)
		if (e.ctrlKey && e.key === 'l') {
			e.preventDefault();
			setHistory([]);
			return;
		}

		// Handle Ctrl+C (Cancel Command)
		if (e.ctrlKey && e.key === 'c') {
			e.preventDefault();
			if (input.trim()) {
				const newItem: HistoryItem = {
					id: generateHistoryId(),
					command: input + '^C',
					response: { type: 'text', content: '' },
					path: currentPath,
				};
				setHistory(prev => [...prev, newItem]);
				setCmdHistory(prev => [...prev, input]);
			} else {
				// Even empty input gets a new line with prompt
				const newItem: HistoryItem = {
					id: generateHistoryId(),
					command: '^C',
					response: { type: 'text', content: '' },
					path: currentPath,
				};
				setHistory(prev => [...prev, newItem]);
			}
			setInput('');
			setCursorPos(0);
			setHistoryIndex(-1);
			return;
		}

		if (e.key === 'Enter') {
			e.preventDefault();
			if (suggestions.length > 0) {
				applySuggestion(suggestions[activeSuggestionIndex]);
				return;
			}

			const response = processCommand(input, currentPath);
			if (response.type === 'clear') {
				setHistory([]);
			} else if (response.type === 'change_directory') {
				if (response.newPath) {
					setCurrentPath(response.newPath);
				}
				const newItem: HistoryItem = {
					id: generateHistoryId(),
					command: input,
					response: { type: 'success', content: '' }, // Don't show output for successful cd
					path: currentPath,
				};
				setHistory(prev => [...prev, newItem]);
			} else {
				const newItem: HistoryItem = {
					id: generateHistoryId(),
					command: input,
					response,
					path: currentPath,
				};
				setHistory(prev => [...prev, newItem]);

				if (response.type === 'open_module' && response.moduleId) {
					const moduleId = response.moduleId;
					setWindows(prev => {
						if (prev.find(w => w.id === moduleId)) return prev;
						return [
							...prev,
							{
								id: moduleId,
								title: moduleId.toUpperCase(),
								component: getModuleComponent(moduleId),
								isOpen: true,
								isMinimized: false,
								position: {
									x: 100 + prev.length * 20,
									y: 100 + prev.length * 20,
								},
							},
						];
					});
				} else if (response.type === 'set_theme' && response.theme) {
					if (response.theme === 'toggle') {
						setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
					} else {
						setTheme(response.theme);
					}
				}
			}
			if (input.trim()) {
				pushCommandToHistory(input);
			}
			setInput('');
			setCursorPos(0);
			setHistoryIndex(-1);
			setActiveSuggestionIndex(0);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (suggestions.length > 0) {
				setActiveSuggestionIndex(prev => Math.max(0, prev - 1));
			} else if (cmdHistory.length > 0) {
				const newIndex =
					historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
				setHistoryIndex(newIndex);
				const newInput = cmdHistory[newIndex];
				setInput(newInput);
				setCursorPos(newInput.length);
			}
		} else if (e.key === 'ArrowDown') {
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
					const newInput = cmdHistory[newIndex];
					setInput(newInput);
					setCursorPos(newInput.length);
				}
			}
		} else if (e.key === 'Tab') {
			e.preventDefault();
			if (!suggestions.length) return;
			const nextValue = suggestions[activeSuggestionIndex];
			applySuggestion(nextValue);
		}
	};

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [history]);

	const handleContainerClick = () => {
		inputRef.current?.focus();
	};

	const showSuggestions = isFocused && suggestions.length > 0 && input.length > 0;

	return (
		<div
			className="h-full flex flex-col bg-terminal-bg text-terminal-text font-mono text-sm overflow-hidden transition-colors duration-300 relative rounded-xl"
			onClick={handleContainerClick}
		>
			{/* Ambient gradient overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-[0.06] pointer-events-none" />

			{/* Terminal Toolbar */}
			<div className="px-4 py-3 border-b border-border/30 bg-background/70 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
				<div className="flex items-center gap-3 text-muted-foreground">
					<div className="flex items-center gap-1.5">
						<span className="w-2.5 h-2.5 rounded-full bg-destructive/70 shadow-[0_0_0_4px_rgba(239,68,68,0.15)]" />
						<span className="w-2.5 h-2.5 rounded-full bg-amber-400/70 shadow-[0_0_0_4px_rgba(251,191,36,0.12)]" />
						<span className="w-2.5 h-2.5 rounded-full bg-emerald-400/70 shadow-[0_0_0_4px_rgba(52,211,153,0.12)]" />
					</div>
					<span className="text-[11px] tracking-[0.28em] uppercase">Terminal</span>
					<span className="px-2 py-0.5 rounded-full border border-border/60 text-[10px]">
						Ctrl+L clear
					</span>
				</div>
				<div className="flex items-center gap-2 flex-wrap">
					{QUICK_COMMANDS.map(cmd => (
						<button
							key={cmd}
							type="button"
							className="px-2 py-1 rounded border border-border/60 bg-background/70 hover:bg-primary/10 hover:border-primary/40 transition-colors"
							onClick={() => applySuggestion(cmd)}
						>
							{cmd}
						</button>
					))}
					<button
						type="button"
						className="px-2 py-1 rounded border border-border/60 bg-background/70 hover:bg-destructive/10 hover:border-destructive/50 transition-colors text-destructive"
						onClick={() => {
							setHistory([]);
							setCmdHistory([]);
							if (typeof window !== 'undefined') {
								window.localStorage.removeItem(CMD_HISTORY_STORAGE_KEY);
							}
						}}
					>
						Clear
					</button>
				</div>
			</div>

			{/* Status strip */}
			<div className="px-4 py-2 border-b border-border/20 bg-background/60 backdrop-blur-sm text-[11px] flex flex-wrap items-center justify-between gap-2 relative z-10">
				<div className="flex items-center gap-2 text-muted-foreground">
					<span className="px-2 py-1 rounded-md border border-border/50 bg-background/60 text-foreground/90">
						Path: {currentPath}
					</span>
					<span className="px-2 py-1 rounded-md border border-border/50 bg-background/60">
						Theme: {resolvedTheme ?? 'system'}
					</span>
				</div>
				<div className="flex items-center gap-2 text-muted-foreground">
					<span className="px-2 py-1 rounded-md border border-border/50 bg-background/60">
						History: {history.length}
					</span>
					<span className="px-2 py-1 rounded-md border border-border/50 bg-background/60">
						Suggestions: {suggestions.length}
					</span>
				</div>
			</div>

			{/* Main Scrollable Container */}
			<div
				ref={scrollRef}
				className="flex-1 min-h-0 overflow-y-auto px-4 py-4 custom-scrollbar space-y-4 relative z-10"
			>
				{/* Minimal Terminal Header */}
				{history.length === 0 && (
					<div className="select-none mb-2 pb-3 border-b border-border/20">
						<div className="text-primary font-semibold text-sm mb-1.5">
							$ AnuragOS Terminal
						</div>
						<div className="text-xs text-muted-foreground/70">
							Type{' '}
							<code className="text-primary bg-primary/10 px-1 py-0.5 rounded text-[10px]">
								help
							</code>{' '}
							for commands, or click files in Explorer.
						</div>
					</div>
				)}
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
								<div
									className={cn(
										'mt-2 pl-3 border-l-2 border-border/40 whitespace-pre-wrap leading-relaxed text-[13px]',
										responseTone(item.response.type),
									)}
								>
									{item.response.content}
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</div>

			{/* Input Area at the bottom */}
			<div className="px-4 pb-4 pt-3 border-t border-border/20 bg-background/70 backdrop-blur-sm relative z-10">
				<div className="flex items-start gap-3 text-sm flex-wrap">
					<span className="text-glow shrink-0 mt-1">{getPromptLabel(currentPath)}</span>
					<div className="relative flex-1 min-w-[140px]">
						<div className="rounded-lg border border-border/50 bg-background/60 px-3 py-2 shadow-inner">
							{/* Hidden input for text capture */}
							<input
								ref={inputRef}
								type="text"
								value={input}
								onChange={e => {
									setInput(e.target.value);
									setCursorPos(e.target.selectionStart || 0);
									setActiveSuggestionIndex(0);
									setHistoryIndex(-1); // Reset history navigation
								}}
								onKeyDown={handleKeyDown}
								onSelect={e => setCursorPos(e.currentTarget.selectionStart || 0)}
								onFocus={() => setIsFocused(true)}
								onBlur={() => setIsFocused(false)}
								className="absolute inset-0 w-full h-full bg-transparent text-transparent caret-transparent outline-none"
								autoComplete="off"
								autoCorrect="off"
								autoCapitalize="off"
								spellCheck="false"
							/>
							{/* Visible input display */}
							<div className="whitespace-pre-wrap break-all">
								<span>{input.substring(0, cursorPos)}</span>
								<span
									className={cn(
										'inline-block w-2 h-4 -mb-1',
										isFocused
											? 'bg-terminal-text animate-pulse'
											: 'bg-transparent',
									)}
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
					<div className="flex flex-wrap gap-2 items-center text-xs">
						<span className="text-muted-foreground font-medium">Suggestions:</span>
						{suggestions.length === 0 && (
							<span className="text-muted-foreground/70">
								Start typing to see tips
							</span>
						)}
						{suggestions.map((suggestion, idx) => (
							<button
								key={suggestion}
								type="button"
								tabIndex={-1}
								onMouseDown={e => e.preventDefault()}
								onClick={() => applySuggestion(suggestion)}
								className={cn(
									'px-2 py-0.5 rounded border transition-colors bg-background/50',
									idx === activeSuggestionIndex
										? 'border-primary/70 text-primary bg-primary/10'
										: 'border-border/40 hover:border-border/70',
								)}
							>
								{suggestion}
							</button>
						))}
					</div>
					<div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
						<span className="px-2 py-1 rounded border border-border/40 bg-muted/30">
							Tab autocomplete
						</span>
						<span className="px-2 py-1 rounded border border-border/40 bg-muted/30">
							↑/↓ history
						</span>
						<span className="px-2 py-1 rounded border border-border/40 bg-muted/30">
							Ctrl+C cancel
						</span>
						<span className="px-2 py-1 rounded border border-border/40 bg-muted/30">
							Ctrl+L clear
						</span>
					</div>
				</div>
			</div>
		</div>
	);
}
