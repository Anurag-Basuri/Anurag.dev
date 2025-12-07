'use client';

import React, { useState, useRef, useEffect } from 'react';
import { processCommand, commandsList, CommandResponse } from '@/lib/commands';
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

export function CLI() {
	const [input, setInput] = useState('');
	const [cursorPos, setCursorPos] = useState(0);
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const [cmdHistory, setCmdHistory] = useState<string[]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const [currentPath, setCurrentPath] = useState('~');
	const inputRef = useRef<HTMLInputElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const [windows, setWindows] = useAtom(windowsAtom);
	const { setTheme, resolvedTheme } = useTheme();
	const [isFocused, setIsFocused] = useState(false);

	// Terminal hints
	const hints = ['help', 'whoami', 'ls', 'open projects', 'open about'];
	const [currentHint, setCurrentHint] = useState(0);
	const [showHint, setShowHint] = useState(false);

	// Dynamic quotes
	const quotes = [
		'💡 Innovation is seeing what everybody has seen and thinking what nobody has thought.',
		'🚀 The best way to predict the future is to invent it.',
		'⚡ Code is poetry in motion.',
		'🎯 First, solve the problem. Then, write the code.',
		'✨ Simplicity is the ultimate sophistication.',
	];
	const [currentQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

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
					id:
						typeof crypto !== 'undefined' && 'randomUUID' in crypto
							? crypto.randomUUID()
							: Math.random().toString(36).slice(2),
					command: input + '^C',
					response: { type: 'text', content: '' },
					path: currentPath,
				};
				setHistory(prev => [...prev, newItem]);
				setCmdHistory(prev => [...prev, input]);
			} else {
				// Even empty input gets a new line with prompt
				const newItem: HistoryItem = {
					id:
						typeof crypto !== 'undefined' && 'randomUUID' in crypto
							? crypto.randomUUID()
							: Math.random().toString(36).slice(2),
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
			const response = processCommand(input, currentPath);
			if (response.type === 'clear') {
				setHistory([]);
			} else if (response.type === 'change_directory') {
				if (response.newPath) {
					setCurrentPath(response.newPath);
				}
				const newItem: HistoryItem = {
					id:
						typeof crypto !== 'undefined' && 'randomUUID' in crypto
							? crypto.randomUUID()
							: Math.random().toString(36).slice(2),
					command: input,
					response: { type: 'success', content: '' }, // Don't show output for successful cd
					path: currentPath,
				};
				setHistory(prev => [...prev, newItem]);
			} else {
				const newItem: HistoryItem = {
					id:
						typeof crypto !== 'undefined' && 'randomUUID' in crypto
							? crypto.randomUUID()
							: Math.random().toString(36).slice(2),
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
				setCmdHistory(prev => [...prev, input]);
			}
			setInput('');
			setCursorPos(0);
			setHistoryIndex(-1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (cmdHistory.length > 0) {
				const newIndex =
					historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
				setHistoryIndex(newIndex);
				const newInput = cmdHistory[newIndex];
				setInput(newInput);
				setCursorPos(newInput.length);
			}
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (historyIndex !== -1) {
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
			const match = commandsList.find(cmd => cmd.startsWith(input.toLowerCase()));
			if (match) {
				setInput(match);
				setCursorPos(match.length);
			}
		}
	};

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, [history]);

	// Rotate hints every 3 seconds
	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentHint(prev => (prev + 1) % hints.length);
		}, 3000);
		return () => clearInterval(timer);
	}, [hints.length]);

	// Show hint when input is empty and focused
	useEffect(() => {
		if (isFocused && input === '') {
			const timer = setTimeout(() => setShowHint(true), 1000);
			return () => clearTimeout(timer);
		} else {
			setShowHint(false);
		}
	}, [isFocused, input]);

	const handleContainerClick = () => {
		inputRef.current?.focus();
	};

	return (
		<div
			className="h-full flex flex-col bg-terminal-bg text-terminal-text font-mono text-sm overflow-hidden transition-colors duration-300 relative"
			onClick={handleContainerClick}
		>
			{/* Subtle terminal gradient overlay */}
			<div className="absolute inset-0 bg-linear-to-br from-primary/[0.02] via-transparent to-accent/[0.02] pointer-events-none" />

			{/* Main Scrollable Container */}
			<div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 custom-scrollbar">
				{/* Terminal Header */}
				<div className="select-none space-y-2 mb-6 border-b border-border/30 pb-4">
					<div className="text-[10px] text-muted-foreground/50 font-mono mb-2">
						Last login: {new Date().toLocaleString()} on ttys001
					</div>
					<div className="text-primary font-bold text-xs whitespace-pre leading-none opacity-80 hidden sm:block">
						{`
    _    _   _ _   _ ____      _    ____   ___  ____  
   / \\  | \\ | | | | |  _ \\    / \\  / ___| / _ \\/ ___| 
  / _ \\ |  \\| | | | | |_) |  / _ \\| |  _ | | | \\___ \\ 
 / ___ \\| |\\  | |_| |  _ <  / ___ \\ |_| || |_| |___) |
/_/   \\_\\_| \\_|\\___/|_| \\_\\/_/   \\_\\____| \\___/|____/ 
`}
					</div>
					<div className="space-y-1 mt-4 font-mono text-[11px]">
						<p className="text-green-500">
							<span className="mr-2">✔</span>Loaded kernel modules...
						</p>
						<p className="text-green-500">
							<span className="mr-2">✔</span>Initialized graphics engine...
						</p>
						<p className="text-green-500">
							<span className="mr-2">✔</span>Mounted file system...
						</p>
						<p className="text-green-500">
							<span className="mr-2">✔</span>Started network services...
						</p>
						<p className="text-primary mt-2 font-semibold">🚀 System Ready.</p>
					</div>
					{/* Inspirational Quote */}
					<div className="mt-3 p-2.5 bg-accent/5 border-l-2 border-accent/40 rounded text-[10px] italic text-accent/80">
						{currentQuote}
					</div>
					{/* Quick Start Guide */}
					<div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded text-[11px] space-y-2">
						<div className="text-primary font-semibold mb-2">⚡ Quick Start:</div>
						<div className="space-y-1 text-muted-foreground">
							<p>
								• Type{' '}
								<code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[10px]">
									about
								</code>{' '}
								to learn about me
							</p>
							<p>
								• Type{' '}
								<code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[10px]">
									projects
								</code>{' '}
								to see my work
							</p>
							<p>
								• Type{' '}
								<code className="text-primary bg-primary/10 px-1.5 py-0.5 rounded text-[10px]">
									help
								</code>{' '}
								for all commands
							</p>
							<p className="text-[10px] mt-2 text-muted-foreground/70">
								💡 Or click files in the Explorer →
							</p>
						</div>
					</div>
				</div>
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
									<span className="text-foreground/90 break-all">
										{item.command}
									</span>
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

					{/* Input Line */}
					<div className="flex items-center gap-2 text-sm flex-wrap">
						<span className="text-glow shrink-0">{getPromptLabel(currentPath)}</span>
						<div className="relative flex-1 group min-w-[100px]">
							<input
								ref={inputRef}
								type="text"
								value={input}
								onChange={e => {
									setInput(e.target.value);
									setCursorPos(e.target.selectionStart || 0);
								}}
								onKeyDown={handleKeyDown}
								onSelect={e => {
									setCursorPos(e.currentTarget.selectionStart || 0);
								}}
								onClick={e => {
									setCursorPos(e.currentTarget.selectionStart || 0);
								}}
								onKeyUp={e => {
									setCursorPos(e.currentTarget.selectionStart || 0);
								}}
								onFocus={() => setIsFocused(true)}
								onBlur={() => setIsFocused(false)}
								className="w-full bg-transparent border-none outline-none text-transparent caret-transparent absolute inset-0 z-10 font-mono"
								autoFocus
								spellCheck={false}
								autoComplete="off"
							/>
							{/* Custom Rendered Input with Cursor */}
							<div className="font-mono whitespace-pre-wrap break-all relative z-0 pointer-events-none">
								<span className="text-foreground/90">
									{input.slice(0, cursorPos)}
								</span>
								<motion.span
									animate={{ opacity: isFocused ? [1, 1, 0, 0] : 0 }}
									transition={{
										duration: 0.8,
										repeat: Infinity,
										times: [0, 0.5, 0.5, 1],
										ease: 'linear',
									}}
									className="inline-block w-[0.6em] h-[1.2em] bg-primary/90 align-text-bottom -mb-[2px] rounded-[1px] shadow-[0_0_8px_var(--primary)]"
								>
									<span className="text-primary-foreground opacity-0">
										{input[cursorPos] || ' '}
									</span>
								</motion.span>
								<span className="text-foreground/90">{input.slice(cursorPos)}</span>
							</div>
						</div>
					</div>
					{/* Typing Hint */}
					<AnimatePresence>
						{showHint && (
							<motion.div
								initial={{ opacity: 0, y: -5 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -5 }}
								transition={{ duration: 0.2 }}
								className="text-xs text-muted-foreground/50 mt-2 ml-2"
							>
								💡 Try:{' '}
								<code className="text-primary/70">{hints[currentHint]}</code>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</div>
	);
}
