import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, X, Bot, Trash2 } from 'lucide-react';
import { useAgentSession } from '../hooks/useAgentSession';
import { AgentMessageBubble } from './AgentMessageBubble';
import { AgentTypingLoader } from './AgentTypingLoader';
import { AgentMessage } from '../types/agent.types';

export interface AgentWindowProps {
	messages: AgentMessage[];
	isLoading: boolean;
	isOpen: boolean;
	setIsOpen: (val: boolean) => void;
	sendMessage: (val: string) => void;
	clearSession: () => void;
}

export function AgentWindow({
	messages,
	isLoading,
	isOpen,
	setIsOpen,
	sendMessage,
	clearSession,
}: AgentWindowProps) {
	const inputRef = useRef<HTMLInputElement>(null);
	const scrollRef = useRef<HTMLDivElement>(null);

	// Auto-scroll to bottom
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
		}
	}, [messages, isLoading, isOpen]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const val = inputRef.current?.value.trim();
		if (!val) return;
		sendMessage(val);
		if (inputRef.current) inputRef.current.value = '';
	};

	if (!isOpen) return null;

	return (
		<motion.div 
			initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: 20, scale: 0.95 }}
			transition={{ type: 'spring', damping: 25, stiffness: 300 }}
			className="fixed bottom-20 right-4 z-9999 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-2xl bg-white/95 shadow-2xl ring-1 ring-zinc-200/50 backdrop-blur-xl transition-colors dark:bg-zinc-950/95 dark:ring-zinc-800/50 sm:bottom-24 sm:right-6 sm:h-[550px] sm:w-[380px]"
		>
			{/* Header */}
			<div className="flex items-center justify-between border-b border-zinc-100 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
				<div className="flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white">
						<Bot size={18} />
					</div>
					<div>
						<h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">AI Assistant</h3>
						<p className="text-xs text-emerald-600 dark:text-emerald-500">Powered by LangChain</p>
					</div>
				</div>
				<div className="flex items-center gap-1">
					<button
						onClick={clearSession}
						className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
						title="Clear Conversation"
					>
						<Trash2 size={16} />
					</button>
					<button
						onClick={() => setIsOpen(false)}
						className="rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 transition-colors dark:hover:bg-zinc-900 dark:hover:text-zinc-300"
					>
						<X size={18} />
					</button>
				</div>
			</div>

			{/* Message List */}
			<div
				ref={scrollRef}
				className="flex-1 overflow-y-auto bg-zinc-50/30 p-4 dark:bg-zinc-900/30 supports-scrollbars:pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-200 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-800"
			>
				{messages.length === 0 ? (
					<div className="flex h-full flex-col items-center justify-center space-y-3 text-center opacity-70">
						<div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
							<Bot size={24} />
						</div>
						<div className="space-y-1">
							<p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Hi there!</p>
							<p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-[200px]">
								I can answer questions about Anurag's projects, LeetCode stats, or schedule a meeting.
							</p>
						</div>
					</div>
				) : (
					<div className="flex flex-col gap-1">
						{messages.map((msg) => (
							<AgentMessageBubble key={msg.id} message={msg} />
						))}
						{isLoading && <AgentTypingLoader />}
					</div>
				)}
			</div>

			{/* Input Area */}
			<div className="border-t border-zinc-100 bg-white/50 p-3 pt-4 dark:border-zinc-800/50 dark:bg-zinc-950/50">
				<form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
					<input
						ref={inputRef}
						disabled={isLoading}
						type="text"
						placeholder={isLoading ? 'Agent is thinking...' : 'Ask me anything about Anurag...'}
						className="flex-1 rounded-full border border-zinc-200 bg-white px-4 py-2.5 pl-4 pr-12 text-sm text-zinc-900 outline-none transition-shadow focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:focus:border-emerald-500"
					/>
					<button
						type="submit"
						disabled={isLoading}
						className="absolute right-1.5 top-1.5 bottom-1.5 flex aspect-square h-auto items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm transition-all hover:bg-emerald-700 hover:scale-105 active:scale-95 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:hover:scale-100 dark:disabled:bg-zinc-800 dark:disabled:text-zinc-600"
					>
						<Send size={15} className="-ml-px" />
					</button>
				</form>
			</div>
		</motion.div>
	);
}
