import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { AgentMessage } from '../types/agent.types';
import { User, Bot } from 'lucide-react';

interface Props {
	message: AgentMessage;
}

export function AgentMessageBubble({ message }: Props) {
	const isUser = message.role === 'user';

	return (
		<motion.div 
			initial={{ opacity: 0, y: 10, scale: 0.98 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ type: 'spring', damping: 20, stiffness: 200 }}
			className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
		>
			<div className={`flex max-w-[85%] gap-2.5 md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
				{/* Avatar */}
				<div
					className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm ${
						isUser
							? 'bg-blue-600 text-white'
							: 'bg-emerald-500 text-white ring-2 ring-emerald-500/20'
					}`}
				>
					{isUser ? <User size={16} /> : <Bot size={16} />}
				</div>

				{/* Bubble Body */}
				<div
					className={`flex flex-col rounded-2xl px-4 py-3 text-sm shadow-sm ${
						isUser
							? 'rounded-tr-sm bg-blue-600 text-white'
							: 'rounded-tl-sm bg-white text-zinc-800 border border-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200'
					}`}
				>
					{isUser ? (
						<p className="whitespace-pre-wrap">{message.content}</p>
					) : (
						<div className="prose prose-sm prose-zinc dark:prose-invert max-w-none wrap-break-word">
							<ReactMarkdown
								remarkPlugins={[remarkGfm]}
								rehypePlugins={[rehypeRaw]}
								components={{
									a: ({ node, ...props }) => (
										<a
											{...props}
											target="_blank"
											rel="noopener noreferrer"
											className="font-medium text-emerald-600 hover:text-emerald-500 hover:underline dark:text-emerald-400 break-all"
										/>
									),
									ul: ({ node, ...props }) => (
										<ul {...props} className="my-1 ml-4 list-disc space-y-1 marker:text-emerald-500" />
									),
									ol: ({ node, ...props }) => (
										<ol {...props} className="my-1 ml-4 list-decimal space-y-1 marker:text-emerald-500" />
									),
									strong: ({ node, ...props }) => (
										<strong {...props} className="font-semibold text-emerald-700 dark:text-emerald-300" />
									),
									code: ({ node, className, children, ...props }: any) => {
										// Simple check if it's an inline code snippet vs a block
										const isInline = !String(children).includes('\n');
										return isInline ? (
											<code {...props} className="rounded-md bg-zinc-200/50 px-1.5 py-0.5 text-xs text-emerald-700 dark:bg-zinc-800 dark:text-emerald-300">
												{children}
											</code>
										) : (
											<pre {...props} className="overflow-x-auto rounded-lg bg-zinc-100 p-3 text-xs dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-inner mt-2 mb-2">
												<code className="text-zinc-800 dark:text-zinc-200 leading-relaxed font-mono">{children}</code>
											</pre>
										);
									},
								}}
							>
								{message.content}
							</ReactMarkdown>
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
}
