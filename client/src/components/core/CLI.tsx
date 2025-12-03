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
			return 'text-[#ff0033]';
		case 'success':
		case 'open_module':
			return 'text-[#00ff41]';
		case 'component':
			return 'text-[#ccc]';
		default:
			return 'text-[#ccc]';
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
			className="h-full flex flex-col bg-[#0a0a0a] text-[#ccc] font-mono text-sm p-4 overflow-hidden border-l border-[#333] shadow-inner transition-colors duration-300"
			onClick={handleContainerClick}
		>
			<div className="mb-4 select-none text-xs space-y-1 text-[#666]">
				<p className="tracking-[0.3em] uppercase text-[#00ff41] opacity-70">
					AnuragOS Terminal
				</p>
				<p>Kernel v2.0.0-alpha [Secure Shell]</p>
				<p>(c) 2025 Anurag Basuri. All rights reserved.</p>
				<p className="pt-2 text-[#666]">Type &apos;help&apos; for available commands.</p>
			</div>

			<ScrollArea className="flex-1 pr-2">
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
								className="rounded-md"
							>
								<div className="flex gap-2 text-sm">
									<span className="text-[#00ff41] font-bold">{promptLabel}</span>
									<span className="text-[#ccc]">{item.command}</span>
								</div>
								<div
									className={cn(
										'mt-1 whitespace-pre-wrap leading-relaxed',
										responseTone(item.response.type),
									)}
								>
									{item.response.content}
								</div>
							</motion.div>
						))}
					</AnimatePresence>

					<div className="flex items-center gap-2 text-sm">
						<span className="text-[#00ff41] font-bold">{promptLabel}</span>
						<div className="relative flex-1">
							<input
								ref={inputRef}
								type="text"
								value={input}
								onChange={e => setInput(e.target.value)}
								onKeyDown={handleKeyDown}
								className="w-full bg-transparent border-none outline-none text-[#ccc] caret-transparent"
								autoFocus
								spellCheck={false}
								autoComplete="off"
							/>
							{/* Custom Block Cursor */}
							<span className="absolute top-0 pointer-events-none text-[#ccc]">
								{input}
								<motion.span
									animate={{ opacity: [1, 0] }}
									transition={{
										duration: 0.8,
										repeat: Infinity,
										ease: 'linear',
									}}
									className="inline-block w-2.5 h-4 bg-[#00ff41] align-middle ml-0.5"
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
