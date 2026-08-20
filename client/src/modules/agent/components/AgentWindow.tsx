import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, X, Bot, Trash2, ExternalLink, Sparkles, Zap } from 'lucide-react';
import type { AgentMessage } from '../types/agent.types';
import { AgentMessageBubble } from './AgentMessageBubble';
import { AgentThinkingLoader } from './AgentThinkingLoader';

const AGENT_WEBSITE_URL =
	process.env.NEXT_PUBLIC_AGENT_WEBSITE_URL || 'https://agent.anuragbasuri.me';

export interface AgentWindowProps {
	messages: AgentMessage[];
	isLoading: boolean;
	isOpen: boolean;
	messagesRemaining: number | null;
	setIsOpen: (val: boolean) => void;
	sendMessage: (val: string) => void;
	retryMessage: (id: string) => void;
	clearSession: () => void;
}

export function AgentWindow({
	messages,
	isLoading,
	isOpen,
	messagesRemaining,
	setIsOpen,
	sendMessage,
	retryMessage,
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

	const isLimitReached = messagesRemaining === 0;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, y: 20, scale: 0.95 }}
			transition={{ type: 'spring', damping: 25, stiffness: 300 }}
			className="fixed bottom-20 right-4 z-9999 flex h-130 w-90 flex-col overflow-hidden rounded-2xl bg-background/95 shadow-2xl ring-1 ring-border backdrop-blur-xl sm:bottom-24 sm:right-6 sm:h-145 sm:w-100"
		>
			{/* Header */}
			<div className="flex items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur-md">
				<div className="flex items-center gap-2.5">
					<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
						<Bot size={18} />
					</div>
					<div>
						<h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
							AI Assistant
							{messagesRemaining !== null && (
								<span
									className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
										messagesRemaining <= 3
											? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
											: 'bg-primary/10 text-primary border-primary/20'
									}`}
								>
									{messagesRemaining} left
								</span>
							)}
						</h3>
						<p className="text-[11px] text-muted-foreground flex items-center gap-1">
							<span>Streaming agent cascade</span>
						</p>
					</div>
				</div>

				<div className="flex items-center gap-1.5">
					{/* Header Redirection Button */}
					<a
						href={AGENT_WEBSITE_URL}
						target="_blank"
						rel="noopener noreferrer"
						title="Launch Full Agent Platform"
						className="flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary transition-all hover:bg-primary/20 hover:scale-105"
					>
						<span>Full Agent</span>
						<ExternalLink size={11} />
					</a>

					<button
						onClick={clearSession}
						className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
						title="Clear Conversation"
					>
						<Trash2 size={16} />
					</button>

					<button
						onClick={() => setIsOpen(false)}
						className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
						title="Close Chat"
					>
						<X size={18} />
					</button>
				</div>
			</div>

			{/* Message List */}
			<div
				ref={scrollRef}
				className="flex-1 overflow-y-auto bg-background/40 p-4 supports-scrollbars:pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted-foreground/20"
			>
				{messages.length === 0 ? (
					<div className="flex h-full flex-col items-center justify-center space-y-3.5 text-center p-4">
						<div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner">
							<Bot size={28} />
							<span className="absolute -top-1 -right-1 flex h-3 w-3">
								<span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
								<span className="relative inline-flex h-3 w-3 rounded-full bg-primary" />
							</span>
						</div>
						<div className="space-y-1.5 max-w-65">
							<p className="text-sm font-semibold text-foreground">Hi there! Ask me anything</p>
							<p className="text-xs text-muted-foreground leading-relaxed">
								Explore Anurag's engineering background, projects, architecture decisions, or coding stats.
							</p>
						</div>

						{/* Quick Promo Chip */}
						<a
							href={AGENT_WEBSITE_URL}
							target="_blank"
							rel="noopener noreferrer"
							className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-400 hover:bg-emerald-500/20 transition-all hover:scale-105"
						>
							<Sparkles size={12} />
							<span>Want unrestricted agent tools? Visit Agent App</span>
						</a>
					</div>
				) : (
					<div className="flex flex-col gap-1">
						{messages.map(msg => (
							<AgentMessageBubble key={msg.id} message={msg} onRetry={retryMessage} />
						))}
						{isLoading && !messages[messages.length - 1]?.content && <AgentThinkingLoader />}
					</div>
				)}
			</div>

			{/* Session Limit Banner */}
			{isLimitReached && (
				<div className="border-t border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-xs text-amber-300 flex items-center justify-between backdrop-blur-md">
					<div className="flex items-center gap-1.5">
						<Zap size={14} className="text-amber-400 shrink-0" />
						<span className="font-medium text-[11px]">Guest session limit reached</span>
					</div>
					<a
						href={AGENT_WEBSITE_URL}
						target="_blank"
						rel="noopener noreferrer"
						className="font-bold underline hover:text-white text-[11px] inline-flex items-center gap-0.5"
					>
						Switch to Agent App <ExternalLink size={10} />
					</a>
				</div>
			)}

			{/* Input Area */}
			<div className="border-t border-border bg-card/60 p-3 backdrop-blur-md">
				<form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
					<input
						ref={inputRef}
						disabled={isLoading || isLimitReached}
						type="text"
						placeholder={
							isLimitReached
								? 'Guest message limit reached.'
								: isLoading
								? 'Agent is responding...'
								: 'Ask anything about Anurag...'
						}
						className="flex-1 rounded-full border border-border bg-background/80 px-4 py-2.5 pl-4 pr-12 text-sm text-foreground outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60 placeholder:text-muted-foreground/50 backdrop-blur-sm"
					/>
					<button
						type="submit"
						disabled={isLoading || isLimitReached}
						className="absolute right-1.5 top-1.5 bottom-1.5 flex aspect-square h-auto items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:scale-105 active:scale-95 disabled:bg-muted disabled:text-muted-foreground disabled:hover:scale-100 cursor-pointer"
					>
						<Send size={15} className="-ml-px" />
					</button>
				</form>
			</div>
		</motion.div>
	);
}
