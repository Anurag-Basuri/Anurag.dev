import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { AgentMessage } from '../types/agent.types';
import { User, Bot, ArrowRight, AlertCircle, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
	message: AgentMessage;
	onRetry?: (id: string) => void;
}

/** Map NAVIGATE targets to user-friendly labels */
function getNavLabel(target: string): string {
	const labels: Record<string, string> = {
		'/portfolio/coding_stats': 'View Coding Stats',
		'/coding-profiles': 'View Coding Stats',
		'/portfolio/projects': 'View Projects',
		'/portfolio/profile': 'View Profile',
		'/portfolio/experience': 'View Experience',
		'/portfolio/education': 'View Education',
		'/portfolio/certifications': 'View Certifications',
		'/portfolio/blog': 'View Blog',
		'/portfolio/achievements': 'View Achievements',
		'/portfolio/contact': 'View Contact',
		'/resume': 'View Resume',
		'/readme': 'View README',
	};
	return labels[target] || `Go to ${target}`;
}

/** Normalize navigation targets to valid routes */
function normalizeNavTarget(target: string): string {
	const fixes: Record<string, string> = {
		'/coding-profiles': '/portfolio/coding_stats',
		'coding-profiles': '/portfolio/coding_stats',
		'/projects': '/portfolio/projects',
		'projects': '/portfolio/projects',
		'/contact': '/portfolio/contact',
		'contact': '/portfolio/contact',
		'/experience': '/portfolio/experience',
		'experience': '/portfolio/experience',
		'/education': '/portfolio/education',
		'education': '/portfolio/education',
		'/blog': '/portfolio/blog',
		'blog': '/portfolio/blog',
		'/achievements': '/portfolio/achievements',
		'achievements': '/portfolio/achievements',
		'/certifications': '/portfolio/certifications',
		'certifications': '/portfolio/certifications',
	};
	const normalized = fixes[target];
	if (normalized) return normalized;
	return target.startsWith('/') ? target : `/${target}`;
}

export function AgentMessageBubble({ message, onRetry }: Props) {
	const isUser = message.role === 'user';
	const router = useRouter();
	const [showDetails, setShowDetails] = useState(false);

	const hasError = message.isError;

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
							? 'bg-primary/80 text-primary-foreground'
							: hasError 
								? 'bg-rose-500 text-white ring-2 ring-rose-500/20'
								: 'bg-primary text-primary-foreground ring-2 ring-primary/20'
					}`}
				>
					{isUser ? <User size={16} /> : hasError ? <AlertCircle size={16} /> : <Bot size={16} />}
				</div>

				{/* Bubble Body */}
				<div className="flex flex-col gap-2">
					<div
						className={`flex flex-col rounded-2xl px-4 py-3 text-sm shadow-sm transition-colors ${
							isUser
								? 'rounded-tr-sm bg-primary text-primary-foreground'
								: hasError
									? 'rounded-tl-sm bg-rose-50 border border-rose-200 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-200'
									: 'rounded-tl-sm bg-card text-card-foreground border border-border'
						}`}
					>
						{isUser ? (
							<p className="whitespace-pre-wrap">{message.content}</p>
						) : (
							<div className="prose prose-sm max-w-none wrap-break-word text-inherit [&_p]:text-inherit [&_li]:text-inherit">
								<ReactMarkdown
									remarkPlugins={[remarkGfm]}
									rehypePlugins={[rehypeRaw]}
									components={{
										a: ({ node, ...props }) => (
											<a
												{...props}
												target="_blank"
												rel="noopener noreferrer"
												className="font-medium text-primary hover:text-primary/80 hover:underline break-all"
											/>
										),
										ul: ({ node, ...props }) => (
											<ul {...props} className="my-1 ml-4 list-disc space-y-1 marker:text-primary" />
										),
										ol: ({ node, ...props }) => (
											<ol {...props} className="my-1 ml-4 list-decimal space-y-1 marker:text-primary" />
										),
										strong: ({ node, ...props }) => (
											<strong {...props} className="font-semibold text-foreground" />
										),
										code: ({ node, className, children, ...props }: any) => {
											const isInline = !String(children).includes('\n');
											return isInline ? (
												<code {...props} className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-primary">
													{children}
												</code>
											) : (
												<pre {...props} className="overflow-x-auto rounded-lg bg-background p-3 text-xs border border-border shadow-inner mt-2 mb-2">
													<code className="text-foreground leading-relaxed font-mono">{children}</code>
												</pre>
											);
										},
									}}
								>
									{message.content}
								</ReactMarkdown>
							</div>
						)}

						{/* Error Details Accordion */}
						{hasError && message.error && (
							<div className="mt-3 border-t border-rose-200/50 pt-2 dark:border-rose-900/30">
								<button 
									onClick={() => setShowDetails(!showDetails)}
									className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-rose-600/70 hover:text-rose-600 dark:text-rose-400/70 dark:hover:text-rose-400"
								>
									{showDetails ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
									Technical Details
								</button>
								
								<AnimatePresence>
									{showDetails && (
										<motion.div
											initial={{ height: 0, opacity: 0 }}
											animate={{ height: 'auto', opacity: 1 }}
											exit={{ height: 0, opacity: 0 }}
											className="overflow-hidden"
										>
											<div className="mt-2 space-y-1 rounded-lg bg-rose-100/50 p-2 font-mono text-[11px] text-rose-900 dark:bg-rose-900/20 dark:text-rose-300">
												<p><span className="opacity-50">Status:</span> {message.error.status || 'N/A'}</p>
												<p><span className="opacity-50">Origin:</span> {message.error.source || 'Unknown'}</p>
												<p><span className="opacity-50">Code:</span> {message.error.code}</p>
												<p className="wrap-break-word line-clamp-3"><span className="opacity-50">Message:</span> {message.error.message}</p>
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						)}
					</div>

					{/* Navigation Buttons or Retry Button */}
					{!isUser && (
						<div className="flex flex-wrap gap-2 pl-1">
							{/* Navigation Links */}
							{message.navigationTargets?.map((target) => {
								const route = normalizeNavTarget(target);
								return (
									<button
										key={target}
										onClick={() => router.push(route)}
										className="group inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary transition-all hover:bg-primary/20 hover:border-primary/40 active:scale-95"
									>
										{getNavLabel(target)}
										<ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
									</button>
								);
							})}

							{/* Retry Button */}
							{hasError && onRetry && (
								<button
									onClick={() => onRetry(message.id)}
									className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-100 px-3 py-1.5 text-xs font-bold text-rose-700 transition-all hover:bg-rose-200 active:scale-95 dark:border-rose-900 dark:bg-rose-900/30 dark:text-rose-300"
								>
									<RotateCcw size={14} />
									Retry Request
								</button>
							)}
						</div>
					)}
				</div>
			</div>
		</motion.div>
	);
}
