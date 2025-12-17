'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fadeInUp, scaleIn } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { ModuleHeader } from '@/modules/shared/ModuleHeader';

interface Message {
	id: string;
	text: string;
	sender: 'user' | 'ai';
	timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
	id: 'welcome',
	text: "Hello! I'm the AI Lab Assistant. I'm currently running in simulation mode while my neural networks are being connected. How can I help you explore this portfolio?",
	sender: 'ai',
	timestamp: new Date(),
};

const MOCK_RESPONSES = [
	"That's an interesting question! In this simulated state, I can tell you that Anurag loves building complex systems.",
	"I'm processing that... *beep boop*... just kidding! But I am designed to assist with portfolio navigation.",
	"My full capabilities are still loading, but I can see you're interested in AI. Check out the 'Projects' folder!",
	"Analyzing input... Status: Curious. Recommendation: Explore the 'Journey' module for career timeline.",
	"I'm a placeholder for a much more powerful agent. Stay tuned for updates!",
];

export function AILabModule() {
	const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
	const [input, setInput] = useState('');
	const [isTyping, setIsTyping] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// Auto-scroll to bottom
	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollIntoView({ behavior: 'smooth' });
		}
	}, [messages, isTyping]);

	const handleSend = async () => {
		if (!input.trim()) return;

		const userMessage: Message = {
			id: Date.now().toString(),
			text: input,
			sender: 'user',
			timestamp: new Date(),
		};

		setMessages(prev => [...prev, userMessage]);
		setInput('');
		setIsTyping(true);

		// Simulate network delay and thinking
		setTimeout(() => {
			const randomResponse =
				MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
			const aiMessage: Message = {
				id: (Date.now() + 1).toString(),
				text: randomResponse,
				sender: 'ai',
				timestamp: new Date(),
			};
			setMessages(prev => [...prev, aiMessage]);
			setIsTyping(false);
		}, 1500);
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="flex flex-col h-full bg-black/20 backdrop-blur-sm">
			{/* Header */}
			<div className="px-6 pt-4 bg-black/20">
				<ModuleHeader
					label="AI Lab Beta"
					icon={Bot}
					title="Experiment_v1.0.2"
					description="Simulation Mode // Neural networks initializing..."
					actions={
						<button
							onClick={() => setMessages([INITIAL_MESSAGE])}
							className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground hover:text-white transition-colors border border-transparent hover:border-white/10"
							title="Reset Chat"
						>
							<RefreshCw className="w-4 h-4" />
						</button>
					}
				/>
			</div>

			{/* Chat Area */}
			<ScrollArea className="flex-1 p-4 md:p-6">
				<div className="space-y-6 max-w-3xl mx-auto">
					{messages.length === 0 ? (
						<div className="text-center text-muted-foreground mt-20">
							<div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-emerald-500/20">
								<Bot className="w-8 h-8 text-emerald-500" />
							</div>
							<h3 className="text-xl font-bold text-foreground mb-2">
								AI Assistant Online
							</h3>
							<p className="max-w-md mx-auto text-sm leading-relaxed text-muted-foreground/80">
								Ask me anything about my projects, skills, or experience. I'm here
								to help you navigate my portfolio.
							</p>
						</div>
					) : (
						messages.map(msg => (
							<motion.div
								key={msg.id}
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								className={cn(
									'flex gap-4 max-w-[85%]',
									msg.sender === 'user' ? 'ml-auto flex-row-reverse' : '',
								)}
							>
								<div
									className={cn(
										'w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm',
										msg.sender === 'user'
											? 'bg-primary/10 border-primary/20 text-primary'
											: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
									)}
								>
									{msg.sender === 'user' ? (
										<User className="w-4 h-4" />
									) : (
										<Bot className="w-4 h-4" />
									)}
								</div>
								<div className="space-y-1">
									<div
										className={cn(
											'p-4 rounded-2xl text-sm leading-relaxed shadow-sm relative overflow-hidden',
											msg.sender === 'user'
												? 'bg-primary/10 border border-primary/20 text-foreground rounded-tr-sm backdrop-blur-md'
												: 'bg-card/40 border border-white/5 text-foreground/90 rounded-tl-sm backdrop-blur-md',
										)}
									>
										{/* Subtle gradient overlay for depth */}
										<div
											className={cn(
												'absolute inset-0 opacity-10 pointer-events-none',
												msg.sender === 'user'
													? 'bg-linear-to-br from-primary via-transparent to-transparent'
													: 'bg-linear-to-br from-emerald-500 via-transparent to-transparent',
											)}
										/>
										<span className="relative z-10">{msg.text}</span>{' '}
										{/* Changed msg.content to msg.text */}
									</div>
									<div
										className={cn(
											'text-[10px] text-muted-foreground/50 font-mono px-1',
											msg.sender === 'user' ? 'text-right' : 'text-left',
										)}
									>
										{msg.timestamp.toLocaleTimeString([], {
											hour: '2-digit',
											minute: '2-digit',
										})}
									</div>
								</div>
							</motion.div>
						))
					)}
					{isTyping && ( // Changed isLoading to isTyping
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="flex gap-4"
						>
							<div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
								<Bot className="w-4 h-4" />
							</div>
							<div className="bg-card/40 border border-white/5 p-4 rounded-2xl rounded-tl-sm backdrop-blur-sm flex items-center gap-1.5">
								<motion.div
									animate={{ scale: [1, 1.2, 1] }}
									transition={{ repeat: Infinity, duration: 1 }}
									className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"
								/>
								<motion.div
									animate={{ scale: [1, 1.2, 1] }}
									transition={{
										repeat: Infinity,
										duration: 1,
										delay: 0.2,
									}}
									className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"
								/>
								<motion.div
									animate={{ scale: [1, 1.2, 1] }}
									transition={{
										repeat: Infinity,
										duration: 1,
										delay: 0.4,
									}}
									className="w-1.5 h-1.5 rounded-full bg-emerald-500/50"
								/>
							</div>
						</motion.div>
					)}
					<div ref={scrollRef} />
				</div>
			</ScrollArea>

			{/* Input Area */}
			<div className="p-4 md:p-6 border-t border-white/5 bg-black/20 backdrop-blur-lg">
				<form onSubmit={handleSend} className="max-w-3xl mx-auto relative">
					<input
						ref={inputRef}
						type="text"
						value={input}
						onChange={e => setInput(e.target.value)}
						placeholder="Ask something..."
						className="w-full bg-card/30 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-foreground placeholder:text-muted-foreground/40 focus:outline-hidden focus:border-emerald-500/30 focus:ring-1 focus:ring-emerald-500/20 transition-all shadow-inner"
						disabled={isTyping} // Changed isLoading to isTyping
					/>
					<button
						type="submit"
						disabled={!input.trim() || isTyping} // Changed isLoading to isTyping
						className="absolute right-2 top-2 p-2 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95"
					>
						<Send className="w-5 h-5" />
					</button>
				</form>
				<div className="max-w-3xl mx-auto mt-2 text-center">
					<p className="text-[10px] text-muted-foreground flex items-center justify-center gap-1.5">
						<Sparkles className="w-3 h-3 text-purple-400" />
						Powered by simulated intelligence
					</p>
				</div>
			</div>
		</div>
	);
}
