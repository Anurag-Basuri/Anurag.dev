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
					setTimeout(() => setState('idle'), 1200);
				} catch {
					setState('error');
					setTimeout(() => setState('idle'), 1200);
				}
			}}
			className="absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-md border border-white/10 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors z-10"
			aria-label="Copy code"
		>
			{state === 'copied' ? 'Copied' : state === 'error' ? 'Failed' : 'Copy'}
		</button>
	);
}

export function MarkdownRenderer({ content }: { content: string }) {
	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSlug]}
			components={{
				h1: ({ node, children, id, ...props }) => (
					<h1
						id={id}
						className="text-3xl sm:text-5xl font-bold tracking-tight text-white mt-12 mb-8 first:mt-0"
						{...props}
					>
						<a href={`#${id}`} className="no-underline hover:underline hover:text-zinc-300 transition-colors">
							{children}
						</a>
					</h1>
				),
				h2: ({ node, children, id, ...props }) => (
					<h2
						id={id}
						className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100 border-b border-white/10 pb-4 mt-14 mb-6"
						{...props}
					>
						<a href={`#${id}`} className="no-underline hover:underline hover:text-zinc-300 transition-colors">
							{children}
						</a>
					</h2>
				),
				h3: ({ node, children, id, ...props }) => (
					<h3
						id={id}
						className="text-xl font-medium text-zinc-200 mt-10 mb-4"
						{...props}
					>
						<a href={`#${id}`} className="no-underline hover:underline hover:text-zinc-300 transition-colors">
							{children}
						</a>
					</h3>
				),
				p: ({ node, ...props }) => (
					<p className="text-zinc-400 text-base leading-relaxed mb-6 font-sans" {...props} />
				),
				a: ({ node, ...props }) => (
					<a
						className="text-blue-400 hover:text-blue-300 hover:underline transition-colors"
						target="_blank"
						rel="noopener noreferrer"
						{...props}
					/>
				),
				ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 mb-6 text-zinc-400 font-sans" {...props} />,
				ol: ({ node, ...props }) => (
					<ol className="list-decimal list-inside space-y-2 mb-6 text-zinc-400 font-sans" {...props} />
				),
				li: ({ node, ...props }) => (
					<li className="text-zinc-400 marker:text-zinc-600" {...props} />
				),
				blockquote: ({ node, ...props }) => (
					<blockquote
						className="border-l-2 border-zinc-700 pl-5 py-1 text-zinc-500 italic my-8 bg-transparent"
						{...props}
					/>
				),
				pre: ({ node, children, ...props }) => {
					const codeText = textFromChildren(children).replace(/\n$/, '');
					return (
						<div className="relative group my-8">
							<CopyButton text={codeText} />
							<pre
								className="relative bg-[#111111] border border-white/5 p-4 sm:p-6 rounded-lg overflow-x-auto"
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
								className={`block font-mono text-[13px] leading-relaxed text-zinc-300 ${className || ''}`}
								{...props}
							>
								{children}
							</code>
						);
					}
					return (
						<code
							className="px-1.5 py-0.5 rounded border border-white/10 bg-zinc-800/40 text-zinc-300 font-mono text-[13px] mx-0.5 whitespace-pre-wrap wrap-break-word"
							{...props}
						>
							{children}
						</code>
					);
				},
				img: ({ node, ...props }) => (
					<div className="relative my-12 rounded-xl overflow-hidden border border-white/10 shadow-lg">
						<img
							className="max-w-full h-auto w-full object-contain bg-[#111111]"
							loading="lazy"
							{...props}
							alt={props.alt || 'Documentation Image'}
						/>
					</div>
				),
				hr: ({ node, ...props }) => (
					<hr className="border-t border-white/10 my-12 w-full" {...props} />
				),
				table: ({ node, ...props }) => (
					<div className="overflow-x-auto w-full my-8 rounded-lg border border-white/10 bg-[#111111]">
						<table className="w-full text-left border-collapse text-sm" {...props} />
					</div>
				),
				thead: ({ node, ...props }) => (
					<thead className="bg-[#1a1a1a] border-b border-white/10 text-zinc-300 font-medium" {...props} />
				),
				th: ({ node, ...props }) => <th className="p-4 tracking-wide text-xs" {...props} />,
				td: ({ node, ...props }) => <td className="p-4 border-b border-white/5 text-zinc-400" {...props} />,
			}}
		>
			{content}
		</ReactMarkdown>
	);
}
