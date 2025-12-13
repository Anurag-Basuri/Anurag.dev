'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { fadeInUp, scaleIn } from '@/lib/animations';
import { cn } from '@/lib/utils';
import { ModuleHeader } from '@/components/apps/shared/ModuleHeader';

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
				<div className="flex flex-col gap-6 max-w-3xl mx-auto pb-4">
					<AnimatePresence initial={false}>
						{messages.map(msg => (
							<motion.div
								key={msg.id}
								variants={scaleIn}
								initial="hidden"
								animate="visible"
								className={cn(
									'flex gap-4 max-w-[85%]',
									msg.sender === 'user'
										? 'self-end flex-row-reverse'
										: 'self-start',
								)}
							>
								{/* Avatar */}
								<div
									className={cn(
										'w-8 h-8 rounded-full flex items-center justify-center shrink-0 border',
										msg.sender === 'user'
											? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
											: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
									)}
								>
									{msg.sender === 'user' ? (
										<User className="w-4 h-4" />
									) : (
										<Bot className="w-4 h-4" />
									)}
								</div>

								{/* Bubble */}
								<div
									className={cn(
										'p-4 rounded-2xl border text-sm leading-relaxed shadow-sm',
										msg.sender === 'user'
											? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-100 rounded-tr-sm'
											: 'bg-card/30 border-border/40 text-foreground rounded-tl-sm backdrop-blur-md',
									)}
								>
									{msg.text}
									<div
										className={cn(
											'text-[10px] mt-2 opacity-50',
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
						))}
					</AnimatePresence>

					{/* Typing Indicator */}
					{isTyping && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="flex gap-4 self-start max-w-[85%]"
						>
							<div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 border bg-purple-500/10 border-purple-500/20 text-purple-400">
								<Bot className="w-4 h-4" />
							</div>
							<div className="p-4 rounded-2xl rounded-tl-sm bg-card/40 border border-border/40 backdrop-blur-md flex items-center gap-1">
								<span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
								<span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
								<span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" />
							</div>
						</motion.div>
					)}
					<div ref={scrollRef} />
				</div>
			</ScrollArea>

			{/* Input Area */}
			<div className="p-4 md:p-6 bg-black/40 backdrop-blur-xl border-t border-border/40">
				<div className="max-w-3xl mx-auto relative flex gap-3">
					<div className="relative flex-1 group">
						<div className="absolute -inset-0.5 bg-linear-to-r from-purple-500/20 to-emerald-500/20 rounded-xl blur opacity-20 group-hover:opacity-40 transition-opacity" />
						<input
							value={input}
							onChange={e => setInput(e.target.value)}
							onKeyDown={handleKeyDown}
							placeholder="Type your message..."
							className="relative w-full bg-[#0a0a0a] text-foreground placeholder:text-muted-foreground/50 border border-white/10 rounded-xl px-4 py-3 focus:outline-hidden focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all font-mono text-sm"
							autoFocus
						/>
					</div>
					<button
						onClick={handleSend}
						disabled={!input.trim() || isTyping}
						className="p-3 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:opacity-50 disabled:hover:bg-purple-500 text-white shadow-lg shadow-purple-500/20 transition-all active:scale-95"
					>
						<Send className="w-5 h-5" />
					</button>
				</div>
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
