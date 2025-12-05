'use client';

import React, { useState, useRef, useEffect } from 'react';
import { processCommand, commandsList, CommandResponse } from '@/lib/commands';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAtom } from 'jotai';
import { windowsAtom } from '@/store/atoms';
import { getModuleComponent } from '@/lib/moduleRegistry';
import { motion, AnimatePresence } from 'framer-motion';

type HistoryItem = {
	id: string;
	command: string;
	response: CommandResponse;
};

const promptLabel = 'root@anuragos:~#';

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
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const [cmdHistory, setCmdHistory] = useState<string[]>([]);
	const [historyIndex, setHistoryIndex] = useState(-1);
	const inputRef = useRef<HTMLInputElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);
	const [windows, setWindows] = useAtom(windowsAtom);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			const response = processCommand(input);
			if (response.type === 'clear') {
				setHistory([]);
			} else {
				const newItem: HistoryItem = {
					id:
						typeof crypto !== 'undefined' && 'randomUUID' in crypto
							? crypto.randomUUID()
							: Math.random().toString(36).slice(2),
					command: input,
					response,
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
				}
			}
			if (input.trim()) {
				setCmdHistory(prev => [...prev, input]);
			}
			setInput('');
			setHistoryIndex(-1);
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (cmdHistory.length > 0) {
				const newIndex =
					historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
				setHistoryIndex(newIndex);
				setInput(cmdHistory[newIndex]);
			}
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (historyIndex !== -1) {
				if (historyIndex === cmdHistory.length - 1) {
					setHistoryIndex(-1);
					setInput('');
				} else {
					const newIndex = Math.min(cmdHistory.length - 1, historyIndex + 1);
					setHistoryIndex(newIndex);
					setInput(cmdHistory[newIndex]);
				}
			}
		} else if (e.key === 'Tab') {
			e.preventDefault();
			const match = commandsList.find(cmd => cmd.startsWith(input.toLowerCase()));
			if (match) setInput(match);
		}
	};

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [history]);

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

			{/* Terminal Header */}
			<div className="px-4 pt-4 pb-3 select-none space-y-2 relative z-10 border-b border-border/30">
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
				<p className="tracking-[0.35em] uppercase text-primary font-semibold text-xs flex items-center gap-2 mt-2">
					<span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_var(--primary)]" />
					AnuragOS Terminal
				</p>
				<div className="text-[10px] text-muted-foreground/70 space-y-0.5 font-normal">
					<p className="tracking-wide">Kernel v2.0.0-alpha [Secure Shell]</p>
					<p className="tracking-wide">(c) 2025 Anurag Basuri. All rights reserved.</p>
				</div>
				<p className="pt-1.5 text-muted-foreground/50 text-[10px] tracking-wide">
					Type &apos;help&apos; for available commands. Try &apos;whoami&apos; or
					&apos;date&apos;.
				</p>
			</div>

			{/* Terminal Content */}
			<ScrollArea className="flex-1 px-4 py-3">
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
								<div className="flex gap-2 text-sm items-baseline">
									<span className="text-primary font-medium text-glow">
										{promptLabel}
									</span>
									<span className="text-foreground/90">{item.command}</span>
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
					<div className="flex items-center gap-2 text-sm">
						<span className="text-primary font-medium text-glow">{promptLabel}</span>
						<div className="relative flex-1">
							<input
								ref={inputRef}
								type="text"
								value={input}
								onChange={e => setInput(e.target.value)}
								onKeyDown={handleKeyDown}
								className="w-full bg-transparent border-none outline-none text-foreground/90 caret-transparent"
								autoFocus
								spellCheck={false}
								autoComplete="off"
							/>
							{/* Custom Block Cursor */}
							<span className="absolute top-0 pointer-events-none text-foreground/90">
								{input}
								<motion.span
									animate={{ opacity: [1, 0.3] }}
									transition={{
										duration: 0.7,
										repeat: Infinity,
										ease: 'easeInOut',
									}}
									className="inline-block w-2 h-4 bg-primary align-middle ml-0.5 rounded-sm shadow-[0_0_12px_var(--primary)]"
								/>
							</span>
						</div>
					</div>
					<div ref={scrollRef} />
				</div>
			</ScrollArea>
		</div>
	);
}
