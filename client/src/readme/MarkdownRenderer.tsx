'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import { useState } from 'react';

function textFromChildren(children: React.ReactNode): string {
	if (typeof children === 'string') return children;
	if (Array.isArray(children)) return children.map(textFromChildren).join('');
	if (children && typeof children === 'object' && 'props' in (children as any)) {
		return textFromChildren((children as any).props?.children);
	}
	return '';
}

function CopyButton({ text }: { text: string }) {
	const [state, setState] = useState<'idle' | 'copied' | 'error'>('idle');

	return (
		<button
			type="button"
			onClick={async () => {
				try {
					await navigator.clipboard.writeText(text);
					setState('copied');
					setTimeout(() => setState('idle'), 1500);
				} catch {
					setState('error');
					setTimeout(() => setState('idle'), 1500);
				}
			}}
			className="absolute top-2.5 right-2.5 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-all z-10 font-mono"
			aria-label="Copy code"
		>
			{state === 'copied' ? '✓ Copied' : state === 'error' ? '✗ Failed' : 'Copy'}
		</button>
	);
}

export function MarkdownRenderer({
	content,
	onNavigate,
}: {
	content: string;
	onNavigate?: (id: string) => void;
}) {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			rehypePlugins={[rehypeSlug]}
			components={{
				/* ─── Headings: theme-colored ─── */
				h1: ({ node, children, id, ...props }) => (
					<h1
						id={id}
						className="text-2xl sm:text-4xl font-bold tracking-tight mt-10 mb-6 first:mt-0 font-mono"
						style={{ color: 'var(--theme-primary)' }}
						{...props}
					>
						<a
							href={`#${id}`}
							onClick={(e) => { if (id && onNavigate) { e.preventDefault(); onNavigate(id); } }}
							className="no-underline hover:opacity-80 transition-opacity"
						>
							<span className="text-muted-foreground/40 mr-2 select-none">#</span>
							{children}
						</a>
					</h1>
				),
				h2: ({ node, children, id, ...props }) => (
					<h2
						id={id}
						className="text-xl sm:text-2xl font-semibold tracking-tight mt-12 mb-5 pb-3 border-b border-border font-mono"
						style={{ color: 'color-mix(in oklch, var(--theme-primary) 85%, var(--theme-fg) 15%)' }}
						{...props}
					>
						<a
							href={`#${id}`}
							onClick={(e) => { if (id && onNavigate) { e.preventDefault(); onNavigate(id); } }}
							className="no-underline hover:opacity-80 transition-opacity"
						>
							<span className="text-muted-foreground/30 mr-2 select-none">##</span>
							{children}
						</a>
					</h2>
				),
				h3: ({ node, children, id, ...props }) => (
					<h3
						id={id}
						className="text-lg font-medium mt-8 mb-3 pl-3 border-l-2 font-mono"
						style={{
							color: 'color-mix(in oklch, var(--theme-primary) 70%, var(--theme-fg) 30%)',
							borderColor: 'color-mix(in oklch, var(--theme-primary) 40%, transparent)',
						}}
						{...props}
					>
						<a
							href={`#${id}`}
							onClick={(e) => { if (id && onNavigate) { e.preventDefault(); onNavigate(id); } }}
							className="no-underline hover:opacity-80 transition-opacity"
						>
							{children}
						</a>
					</h3>
				),

				/* ─── Prose ─── */
				p: ({ node, ...props }) => (
					<p className="text-muted-foreground text-sm leading-relaxed mb-5 font-mono" {...props} />
				),
				strong: ({ node, ...props }) => (
					<strong className="text-foreground font-semibold" {...props} />
				),
				em: ({ node, ...props }) => (
					<em className="text-muted-foreground italic" {...props} />
				),
				a: ({ node, ...props }) => (
					<a
						className="hover:underline transition-colors font-mono"
						style={{ color: 'var(--theme-secondary, var(--theme-primary))' }}
						target="_blank"
						rel="noopener noreferrer"
						{...props}
					/>
				),

				/* ─── Lists ─── */
				ul: ({ node, ...props }) => (
					<ul className="space-y-1.5 mb-5 text-muted-foreground font-mono text-sm pl-1" {...props} />
				),
				ol: ({ node, ...props }) => (
					<ol className="list-decimal pl-5 space-y-1.5 mb-5 text-muted-foreground font-mono text-sm" {...props} />
				),
				li: ({ node, children, ...props }) => (
					<li className="relative pl-4" {...props}>
						<span
							className="absolute left-0 top-[9px] w-1.5 h-1.5 rounded-full"
							style={{ background: 'color-mix(in oklch, var(--theme-primary) 40%, transparent)' }}
						/>
						{children}
					</li>
				),

				/* ─── Blockquote ─── */
				blockquote: ({ node, ...props }) => (
					<blockquote
						className="border-l-2 pl-5 py-1 my-6 text-muted-foreground italic font-mono text-sm"
						style={{ borderColor: 'color-mix(in oklch, var(--theme-primary) 30%, transparent)' }}
						{...props}
					/>
				),

				/* ─── Code Blocks ─── */
				pre: ({ node, children, ...props }) => {
					const codeText = textFromChildren(children).replace(/\n$/, '');
					return (
						<div className="relative group my-6 rounded-lg overflow-hidden border border-border">
							<CopyButton text={codeText} />
							{/* Faint theme glow on hover */}
							<div
								className="absolute -inset-px rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
								style={{ background: `linear-gradient(135deg, color-mix(in oklch, var(--theme-primary) 8%, transparent), transparent 50%)` }}
							/>
							<pre
								className="relative p-4 sm:p-5 overflow-x-auto text-sm font-mono leading-relaxed bg-card/50"
								{...props}
							>
								{children}
							</pre>
						</div>
					);
				},
				code: ({ node, className, children, ...props }) => {
					const isBlock = /language-(\w+)/.exec(className || '');
					if (isBlock) {
						return (
							<code
								className={`block font-mono text-[13px] leading-relaxed ${className || ''}`}
								style={{ color: 'color-mix(in oklch, var(--theme-primary) 65%, var(--theme-fg) 35%)' }}
								{...props}
							>
								{children}
							</code>
						);
					}
					return (
						<code
							className="px-1.5 py-0.5 rounded border border-border bg-muted font-mono text-[12px] mx-0.5 wrap-break-word"
							style={{ color: 'color-mix(in oklch, var(--theme-primary) 65%, var(--theme-fg) 35%)' }}
							{...props}
						>
							{children}
						</code>
					);
				},

				/* ─── Media ─── */
				img: ({ node, ...props }) => (
					<div className="relative my-8 rounded-lg overflow-hidden border border-border">
						<img
							className="max-w-full h-auto w-full object-contain bg-card"
							loading="lazy"
							{...props}
							alt={props.alt || 'Documentation Image'}
						/>
					</div>
				),
				hr: ({ node, ...props }) => (
					<div className="my-10 flex items-center justify-center" {...props}>
						<div
							className="w-full h-px"
							style={{ background: 'linear-gradient(90deg, transparent, color-mix(in oklch, var(--theme-primary) 20%, transparent), transparent)' }}
						/>
					</div>
				),

				/* ─── Tables ─── */
				table: ({ node, ...props }) => (
					<div className="overflow-x-auto w-full my-6 rounded-lg border border-border bg-card/50">
						<table className="w-full text-left border-collapse text-sm font-mono" {...props} />
					</div>
				),
				thead: ({ node, ...props }) => (
					<thead
						className="border-b border-border text-xs uppercase tracking-wider bg-muted/50"
						style={{ color: 'color-mix(in oklch, var(--theme-primary) 60%, var(--theme-fg) 40%)' }}
						{...props}
					/>
				),
				th: ({ node, ...props }) => <th className="p-3" {...props} />,
				td: ({ node, ...props }) => <td className="p-3 border-b border-border text-muted-foreground" {...props} />,
			}}
		>
			{content}
		</ReactMarkdown>
	);
}
