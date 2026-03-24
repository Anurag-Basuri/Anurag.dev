import React from 'react';
import { motion } from 'framer-motion';
import { User, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatMessageData } from './useChatSession';

interface ChatMessageProps {
	message: ChatMessageData;
}

export function ChatMessage({ message }: ChatMessageProps) {
	const isUser = message.role === 'user';

	return (
		<motion.div
			initial={{ opacity: 0, y: 10, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ type: 'spring', stiffness: 400, damping: 25 }}
			className={cn(
				'flex w-full gap-3',
				isUser ? 'flex-row-reverse' : 'flex-row'
			)}
		>
			{/* Avatar */}
			<div
				className={cn(
					'flex shrink-0 items-center justify-center w-8 h-8 rounded-full shadow-sm',
					isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary border border-border/50 text-foreground'
				)}
			>
				{isUser ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-primary" />}
			</div>

			{/* Bubble */}
			<div
				className={cn(
					'relative px-4 py-3 max-w-[85%] text-sm rounded-2xl break-words',
					isUser
						? 'bg-primary text-primary-foreground rounded-tr-sm shadow-[0_4px_14px_0_rgba(var(--primary),0.2)]'
						: 'bg-muted border border-border/40 text-foreground rounded-tl-sm shadow-sm'
				)}
			>
				{/* Simple paragraph splitting for markdown-like formatting */}
				{message.content.split('\n').map((paragraph, i) => (
					<React.Fragment key={i}>
						{paragraph}
						{i < message.content.split('\n').length - 1 && <br />}
					</React.Fragment>
				))}
			</div>
		</motion.div>
	);
}
