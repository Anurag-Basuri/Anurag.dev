'use client';

import { useMemo } from 'react';
import { TerminalFrame } from '@/ui/TerminalFrame';
import type { ReadmeDocMeta, TocItem } from './types';
import { MarkdownRenderer } from './MarkdownRenderer';

function slugify(input: string): string {
	return input
		.toLowerCase()
		.trim()
		.replace(/[`~!@#$%^&*()=+\[\]{\\}|;:'",.<>/?]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-');
}

function buildToc(content: string): TocItem[] {
	const lines = content.split(/\r?\n/);
	const items: TocItem[] = [];
	const seen = new Map<string, number>();

	for (const line of lines) {
		const m = /^(#{1,3})\s+(.+?)\s*$/.exec(line);
		if (!m) continue;
		const depth = m[1]!.length as 1 | 2 | 3;
		const text = m[2]!.replace(/\s+#*$/, '').trim();
		let id = slugify(text);
		const n = (seen.get(id) ?? 0) + 1;
		seen.set(id, n);
		if (n > 1) id = `${id}-${n}`;
		items.push({ depth, text, id });
	}

	return items;
}

export function ReadmeViewer({
	content,
	docMeta,
}: {
	content: string;
	docMeta: ReadmeDocMeta;
}) {
	const toc = useMemo(() => buildToc(content), [content]);

	return (
		<div className="w-full h-full flex flex-col p-4 sm:p-8 pt-6 pb-10">
			<TerminalFrame meta={docMeta}>
				<div className="h-full w-full flex gap-6 p-4 sm:p-6 lg:p-8">
					{/* Main scroll body */}
					<div className="flex-1 min-w-0">
						<div className="h-[72vh] overflow-y-auto pr-2">
							<div className="max-w-3xl mx-auto">
								<MarkdownRenderer content={content} />
							</div>
						</div>
					</div>

					{/* TOC */}
					<aside className="hidden lg:block w-64 shrink-0">
						<div className="sticky top-2 rounded-xl border border-white/10 bg-black/35 backdrop-blur-xl p-4">
							<p className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-3">
								Table of contents
							</p>
							<nav className="space-y-1.5">
								{toc.slice(0, 60).map(item => (
									<a
										key={item.id}
										href={`#${item.id}`}
										className="block text-xs text-white/60 hover:text-white transition-colors"
										style={{
											paddingLeft:
												item.depth === 1
													? 0
													: item.depth === 2
														? 10
														: 20,
										}}
									>
										{item.text}
									</a>
								))}
							</nav>
						</div>
					</aside>
				</div>
			</TerminalFrame>
		</div>
	);
}

