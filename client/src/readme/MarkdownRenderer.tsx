'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useMemo, useState } from 'react';

function slugify(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.replace(/[`~!@#$%^&*()=+\[\]{\\}|;:'",.<>/?]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

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
			className="absolute top-2 right-2 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-md border border-white/10 bg-black/40 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
			aria-label="Copy code"
		>
			{state === 'copied' ? 'Copied' : state === 'error' ? 'Failed' : 'Copy'}
		</button>
	);
}

export function MarkdownRenderer({ content }: { content: string }) {
	const headingCounts = useMemo(() => new Map<string, number>(), []);

	return (
		<ReactMarkdown
			remarkPlugins={[remarkGfm]}
			components={{
				h1: ({ node, children, ...props }) => {
					const text = textFromChildren(children);
					let id = slugify(text);
					const n = (headingCounts.get(id) ?? 0) + 1;
					headingCounts.set(id, n);
					if (n > 1) id = `${id}-${n}`;

					return (
						<h1
							id={id}
							className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter mt-12 mb-6 uppercase first:mt-0"
							style={{ color: 'var(--theme-primary)' }}
							{...props}
						>
							<a href={`#${id}`} className="no-underline hover:underline">
								{children}
							</a>
						</h1>
					);
				},
				h2: ({ node, children, ...props }) => {
					const text = textFromChildren(children);
					let id = slugify(text);
					const n = (headingCounts.get(id) ?? 0) + 1;
					headingCounts.set(id, n);
					if (n > 1) id = `${id}-${n}`;

					return (
						<h2
							id={id}
							className="text-2xl sm:text-3xl font-bold tracking-tight border-b pb-3 mt-10 mb-5"
							style={{
								color: 'color-mix(in oklch, var(--theme-primary) 90%, white 10%)',
								borderColor: 'color-mix(in oklch, var(--theme-primary) 25%, transparent)',
							}}
							{...props}
						>
							<a href={`#${id}`} className="no-underline hover:underline">
								{children}
							</a>
						</h2>
					);
				},
				h3: ({ node, children, ...props }) => {
					const text = textFromChildren(children);
					let id = slugify(text);
					const n = (headingCounts.get(id) ?? 0) + 1;
					headingCounts.set(id, n);
					if (n > 1) id = `${id}-${n}`;

					return (
						<h3
							id={id}
							className="text-xl font-bold mt-8 mb-4 border-l-2 pl-3"
							style={{
								color: 'color-mix(in oklch, var(--theme-primary) 75%, white 25%)',
								borderColor: 'color-mix(in oklch, var(--theme-primary) 45%, transparent)',
							}}
							{...props}
						>
							<a href={`#${id}`} className="no-underline hover:underline">
								{children}
							</a>
						</h3>
					);
				},
				p: ({ node, ...props }) => (
					<p className="text-white/75 text-base sm:text-lg leading-relaxed mb-6 font-sans" {...props} />
				),
				a: ({ node, ...props }) => (
					<a
						className="no-underline hover:underline border-b pb-0.5"
						style={{
							color: 'var(--theme-secondary)',
							borderColor: 'color-mix(in oklch, var(--theme-secondary) 35%, transparent)',
						}}
						target="_blank"
						rel="noopener noreferrer"
						{...props}
					/>
				),
				ul: ({ node, ...props }) => <ul className="list-none space-y-2 mb-6 text-white/75 font-sans" {...props} />,
				ol: ({ node, ...props }) => (
					<ol className="list-decimal list-inside space-y-2 mb-6 text-white/75 font-sans" {...props} />
				),
				li: ({ node, ...props }) => (
					<li
						className="relative pl-6 before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:rounded-sm"
						style={{ ['--tw-before-bg' as any]: 'color-mix(in oklch, var(--theme-primary) 55%, transparent)' }}
						{...props}
					/>
				),
				blockquote: ({ node, ...props }) => (
					<blockquote
						className="border-l-4 bg-linear-to-r px-6 py-3 rounded-r-xl my-8 text-white/80 italic font-serif"
						style={{
							borderColor: 'color-mix(in oklch, var(--theme-primary) 55%, transparent)',
							backgroundImage:
								'linear-gradient(to right, color-mix(in oklch, var(--theme-primary) 12%, transparent), transparent)',
						}}
						{...props}
					/>
				),
				pre: ({ node, children, ...props }) => {
					const codeText = textFromChildren(children).replace(/\n$/, '');
					return (
						<div className="relative group my-8">
							<div
								className="absolute -inset-1 rounded-xl blur-lg opacity-25 group-hover:opacity-50 transition duration-700"
								style={{
									background:
										'linear-gradient(90deg, color-mix(in oklch, var(--theme-primary) 25%, transparent), color-mix(in oklch, var(--theme-secondary) 25%, transparent))',
								}}
							/>
							<CopyButton text={codeText} />
							<pre
								className="relative bg-black/60 border p-6 pt-10 rounded-xl overflow-x-auto shadow-inner"
								style={{ borderColor: 'color-mix(in oklch, var(--theme-primary) 25%, transparent)' }}
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
								className={`block font-mono text-xs sm:text-sm leading-relaxed ${className || ''}`}
								style={{ color: 'color-mix(in oklch, var(--theme-primary) 70%, white 30%)' }}
								{...props}
							>
								{children}
							</code>
						);
					}
					return (
						<code
							className="px-1.5 py-0.5 rounded-md border font-mono text-sm mx-0.5"
							style={{
								background: 'color-mix(in oklch, var(--theme-primary) 10%, transparent)',
								borderColor: 'color-mix(in oklch, var(--theme-primary) 22%, transparent)',
								color: 'color-mix(in oklch, var(--theme-primary) 70%, white 30%)',
							}}
							{...props}
						>
							{children}
						</code>
					);
				},
				img: ({ node, ...props }) => (
					<div className="relative my-10 rounded-xl overflow-hidden border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.25)]">
						<img
							className="max-w-full h-auto w-full object-contain bg-black/30"
							loading="lazy"
							{...props}
							alt={props.alt || 'Documentation Image'}
						/>
					</div>
				),
				hr: ({ node, ...props }) => (
					<div className="w-full flex items-center justify-center my-12" {...props}>
						<div
							className="w-full h-px"
							style={{
								background:
									'linear-gradient(to right, transparent, color-mix(in oklch, var(--theme-primary) 30%, transparent), transparent)',
							}}
						/>
					</div>
				),
				table: ({ node, ...props }) => (
					<div className="overflow-x-auto w-full my-8 rounded-xl border border-white/10 bg-black/25">
						<table className="w-full text-left border-collapse text-sm" {...props} />
					</div>
				),
				thead: ({ node, ...props }) => (
					<thead className="bg-black/40 border-b border-white/10 text-white/80 font-bold" {...props} />
				),
				th: ({ node, ...props }) => <th className="p-4 tracking-wider uppercase text-xs" {...props} />,
				td: ({ node, ...props }) => <td className="p-4 border-b border-white/5 text-white/70" {...props} />,
			}}
		>
			{content}
		</ReactMarkdown>
	);
}

