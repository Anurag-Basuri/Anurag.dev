'use client';

import { useMemo } from 'react';
import { TerminalFrame } from '@/ui/TerminalFrame';
import type { ReadmeDocMeta, TocItem } from './types';
import { MarkdownRenderer } from './MarkdownRenderer';

import GithubSlugger from 'github-slugger';

function buildToc(content: string): TocItem[] {
	const slugger = new GithubSlugger();
	const lines = content.split(/\r?\n/);
	const items: TocItem[] = [];
	let inCodeBlock = false;

	for (const line of lines) {
		if (line.trim().startsWith('```')) {
			inCodeBlock = !inCodeBlock;
			continue;
		}
		if (inCodeBlock) continue;

		const m = /^(#{1,3})\s+(.+?)\s*$/.exec(line);
		if (!m) continue;

		const depth = m[1]!.length as 1 | 2 | 3;
		let text = m[2]!.replace(/\s+#*$/, '').trim();
		// Strip basic markdown syntax
		text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1'); // links
		text = text.replace(/[*_~`]/g, '');

		const id = slugger.slug(text);
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

	const handleTocClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
		e.preventDefault();
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
			// Gracefully update the URL hash without triggering native browser jumping
			history.pushState(null, '', `#${id}`);
		}
	};

	return (
		<div className="w-full h-full flex flex-col p-4 sm:p-8 pt-6 pb-10 bg-[#050505]">
			<TerminalFrame meta={docMeta}>
				<div className="h-full w-full flex gap-6 p-4 sm:p-6 lg:p-8">
					{/* Main scroll body */}
					<div className="flex-1 min-w-0 relative">
						<div className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700/50 scrollbar-track-transparent pr-4 sm:pr-8 pb-12">
							<div className="max-w-4xl mx-auto">
								<MarkdownRenderer content={content} />
							</div>
						</div>
					</div>

					{/* TOC */}
					<aside className="hidden lg:block w-64 shrink-0">
						<div className="sticky top-2 border border-white/5 bg-[#111111] rounded-xl p-5 shadow-xl">
							<p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 mb-4 flex items-center gap-2">
								<span className="w-1 h-3 bg-zinc-700/50 rounded-full" />
								On this page
							</p>
							<nav className="space-y-1.5">
								{toc.slice(0, 60).map(item => (
									<a
										key={item.id}
										href={`#${item.id}`}
										onClick={(e) => handleTocClick(e, item.id)}
										className="block text-[13px] text-zinc-400 hover:text-white transition-colors py-1"
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

