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
			className="h-full flex flex-col bg-terminal-bg text-terminal-text font-mono text-sm overflow-hidden transition-colors duration-300 relative"
			onClick={handleContainerClick}
		>
			{/* Subtle terminal gradient overlay */}
			<div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] via-transparent to-accent/[0.02] pointer-events-none" />

			{/* Main Scrollable Container */}
			<div ref={scrollRef} className="flex-1 overflow-y-auto px-4 pt-3 custom-scrollbar">
				{/* Minimal Terminal Header */}
				{history.length === 0 && (
					<div className="select-none mb-4 pb-3 border-b border-border/20">
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
								className="rounded"
							>
								<div className="flex gap-2 text-sm items-baseline flex-wrap">
									<span className="text-glow shrink-0">
										{getPromptLabel(item.path)}
									</span>
									<span className="flex-1 break-all">{item.command}</span>
								</div>
								<div
									className={cn(
										'mt-1.5 pl-2 border-l-2 border-border/40 whitespace-pre-wrap leading-relaxed text-[13px]',
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
			<div className="px-4 pb-3 pt-2 border-t border-border/20">
				<div className="flex items-center gap-2 text-sm flex-wrap">
					<span className="text-glow shrink-0">{getPromptLabel(currentPath)}</span>
					<div className="relative flex-1 min-w-[100px]">
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
									isFocused ? 'bg-terminal-text animate-pulse' : 'bg-transparent',
								)}
							/>
							<span>{input.substring(cursorPos)}</span>
						</div>
					</div>
				</div>
				{/* Suggestions Box */}
				<div
					className={cn(
						'mt-2 transition-opacity duration-150',
						showSuggestions ? 'opacity-100' : 'opacity-0 pointer-events-none',
					)}
				>
					<div className="flex flex-wrap gap-2 items-center text-xs">
						<span className="text-muted-foreground font-medium">Suggestions:</span>
						{suggestions.map((suggestion, idx) => (
							<button
								key={suggestion}
								type="button"
								tabIndex={-1}
								onMouseDown={e => e.preventDefault()}
								onClick={() => applySuggestion(suggestion)}
								className={cn(
									'px-2 py-0.5 rounded border transition-colors bg-background/40',
									idx === activeSuggestionIndex
										? 'border-primary/70 text-primary bg-primary/10'
										: 'border-border/40 hover:border-border/70',
								)}
							>
								{suggestion}
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
