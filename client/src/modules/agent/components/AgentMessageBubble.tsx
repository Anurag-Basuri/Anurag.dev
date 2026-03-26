import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { useRouter } from 'next/navigation';
import type { AgentMessage } from '../types/agent.types';
import { User, Bot, ArrowRight } from 'lucide-react';

interface Props {
	message: AgentMessage;
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
	// Fix known mismatches
	const fixes: Record<string, string> = {
		'/coding-profiles': '/portfolio/coding_stats',
		'coding-profiles': '/portfolio/coding_stats',
	};
	const normalized = fixes[target];
	if (normalized) return normalized;
	return target.startsWith('/') ? target : `/${target}`;
}

export function AgentMessageBubble({ message }: Props) {
	const isUser = message.role === 'user';
	const router = useRouter();

	return (
		<motion.div
			initial={{ opacity: 0, y: 10, scale: 0.98 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ type: 'spring', damping: 20, stiffness: 200 }}
			className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
		>
			<div
				className={`flex max-w-[85%] gap-2.5 md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
			>
				{/* Avatar */}
				<div
					className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-sm ${
						isUser
							? 'bg-primary/80 text-primary-foreground'
							: 'bg-primary text-primary-foreground ring-2 ring-primary/20'
					}`}
				>
					{isUser ? <User size={16} /> : <Bot size={16} />}
				</div>

				{/* Bubble Body */}
				<div className="flex flex-col gap-2">
					<div
						className={`flex flex-col rounded-2xl px-4 py-3 text-sm shadow-sm ${
							isUser
								? 'rounded-tr-sm bg-primary text-primary-foreground'
								: 'rounded-tl-sm bg-card text-card-foreground border border-border'
						}`}
					>
						{isUser ? (
							<p className="whitespace-pre-wrap">{message.content}</p>
						) : (
							<div className="prose prose-sm max-w-none wrap-break-word text-card-foreground [&_p]:text-card-foreground [&_li]:text-card-foreground">
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
											<ul
												{...props}
												className="my-1 ml-4 list-disc space-y-1 marker:text-primary"
											/>
										),
										ol: ({ node, ...props }) => (
											<ol
												{...props}
												className="my-1 ml-4 list-decimal space-y-1 marker:text-primary"
											/>
										),
										strong: ({ node, ...props }) => (
											<strong
												{...props}
												className="font-semibold text-foreground"
											/>
										),
										code: ({ node, className, children, ...props }: any) => {
											const isInline = !String(children).includes('\n');
											return isInline ? (
												<code
													{...props}
													className="rounded-md bg-muted px-1.5 py-0.5 text-xs text-primary"
												>
													{children}
												</code>
											) : (
												<pre
													{...props}
													className="overflow-x-auto rounded-lg bg-background p-3 text-xs border border-border shadow-inner mt-2 mb-2"
												>
													<code className="text-foreground leading-relaxed font-mono">
														{children}
													</code>
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

					{/* Navigation Buttons — rendered below the bubble */}
					{!isUser &&
						message.navigationTargets &&
						message.navigationTargets.length > 0 && (
							<div className="flex flex-wrap gap-2 pl-1">
								{message.navigationTargets.map(target => {
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
							</div>
						)}
				</div>
			</div>
		</motion.div>
	);
}
