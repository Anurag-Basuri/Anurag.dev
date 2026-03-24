import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useChatSession } from './useChatSession';
import { ChatMessage } from './ChatMessage';

export function ChatWidget() {
	const { messages, isLoading, isOpen, setIsOpen, sendMessage, clearSession } = useChatSession();
	const [inputValue, setInputValue] = useState('');
	const [isExpanded, setIsExpanded] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Auto-scroll to bottom on new messages
	useEffect(() => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages, isLoading]);

	// Auto-focus input when opened
	useEffect(() => {
		if (isOpen) {
			setTimeout(() => inputRef.current?.focus(), 100);
		}
	}, [isOpen]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!inputValue.trim() || isLoading) return;
		sendMessage(inputValue);
		setInputValue('');
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	return (
		<div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 20, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 20, scale: 0.95 }}
						transition={{ type: 'spring', stiffness: 350, damping: 25 }}
						className={cn(
							"pointer-events-auto flex flex-col mb-4 bg-background/90 backdrop-blur-xl border border-border/60 shadow-2xl overflow-hidden transition-all duration-300",
							isExpanded 
								? "w-[min(calc(100vw-3rem),600px)] h-[min(calc(100vh-8rem),800px)] rounded-3xl" 
								: "w-[min(calc(100vw-3rem),380px)] h-[min(calc(100vh-8rem),550px)] rounded-2xl"
						)}
					>
						{/* Header */}
						<div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border/50 shrink-0">
							<div className="flex items-center gap-2.5">
								<div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
									<Bot className="w-4 h-4 text-primary" />
								</div>
								<div>
									<h3 className="font-bold text-sm tracking-tight">Anurag's Assistant</h3>
									<div className="flex items-center gap-1.5 opacity-80">
										<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
										<span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Online</span>
									</div>
								</div>
							</div>
							<div className="flex items-center gap-1">
								{messages.length > 0 && (
									<button
										onClick={clearSession}
										className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
										title="Clear chat"
									>
										<Trash2 className="w-4 h-4" />
									</button>
								)}
								<button
									onClick={() => setIsExpanded(!isExpanded)}
									className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors hidden sm:block"
									title={isExpanded ? "Collapse" : "Expand"}
								>
									{isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
								</button>
								<button
									onClick={() => setIsOpen(false)}
									className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
									title="Close"
								>
									<X className="w-4 h-4" />
								</button>
							</div>
						</div>

						{/* Messages Area */}
						<div className="flex-1 overflow-y-auto p-4 flex flex-col space-y-5 scroll-smooth relative">
							{messages.length === 0 ? (
								<div className="absolute inset-0 flex items-center justify-center p-6 sm:p-8">
									<div className="flex flex-col items-center text-center max-w-xs">
										<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 ring-8 ring-primary/5">
											<Bot className="w-8 h-8 text-primary" />
										</div>
										<h4 className="text-lg font-bold mb-2">Ask me anything</h4>
										<p className="text-sm text-muted-foreground mb-6">
											I'm an AI assistant trained on Anurag's portfolio, projects, and professional background.
										</p>
										<div className="flex flex-col gap-2 w-full">
											{[
												"What's your main tech stack?",
												"Show me your best React project",
												"Are you available for work?",
											].map((suggestion) => (
												<button
													key={suggestion}
													onClick={() => sendMessage(suggestion)}
													className="text-xs text-left px-4 py-2.5 rounded-xl bg-muted/50 hover:bg-muted border border-border/30 hover:border-border/60 transition-colors"
												>
													"{suggestion}"
												</button>
											))}
										</div>
									</div>
								</div>
							) : (
								<>
									{messages.map(msg => (
										<ChatMessage key={msg.id} message={msg} />
									))}
									{isLoading && (
										<div className="flex gap-2 items-center text-muted-foreground self-start pl-12">
											<div className="flex items-center gap-1 px-3 py-2 bg-muted rounded-2xl rounded-tl-sm">
												<span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce" />
												<span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.15s]" />
												<span className="w-1.5 h-1.5 rounded-full bg-current animate-bounce [animation-delay:-0.3s]" />
											</div>
										</div>
									)}
									<div ref={messagesEndRef} className="h-2 shrink-0" />
								</>
							)}
						</div>

						{/* Input Area */}
						<div className="p-3 bg-card border-t border-border/40 shrink-0">
							<form
								onSubmit={handleSubmit}
								className="relative flex items-end gap-2 p-1.5 bg-background border border-border/60 rounded-2xl shadow-sm focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 transition-all"
							>
								<textarea
									ref={inputRef as any}
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
									onKeyDown={handleKeyDown}
									placeholder="Ask something..."
									className="flex-1 max-h-32 min-h-[40px] px-3 py-2.5 bg-transparent border-0 focus:ring-0 resize-none text-sm leading-relaxed"
									rows={1}
									disabled={isLoading}
								/>
								<button
									type="submit"
									disabled={!inputValue.trim() || isLoading}
									className="p-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground shrink-0 transition-colors shadow-sm disabled:shadow-none mb-0.5 mr-0.5"
								>
									<Send className="w-4 h-4 translate-x-px translate-y-px" />
								</button>
							</form>
							<div className="text-center mt-2.5">
								<p className="text-[10px] text-muted-foreground/60 font-medium">
									AI can make mistakes. Verify important info.
								</p>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Floating Toggle Button */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className={cn(
					"pointer-events-auto flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_30px_-4px_rgba(var(--primary),0.5)] transition-all duration-300 hover:scale-110 active:scale-95 group",
					isOpen ? "w-12 h-12 bg-secondary text-foreground shadow-lg" : "w-14 h-14"
				)}
			>
				{isOpen ? (
					<X className="w-5 h-5 transition-transform group-hover:rotate-90" />
				) : (
					<Bot className="w-6 h-6 transition-transform group-hover:-translate-y-0.5 group-hover:rotate-6" />
				)}
			</button>
		</div>
	);
}
