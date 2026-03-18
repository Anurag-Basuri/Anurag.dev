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
		text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
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

	const scrollToId = (id: string) => {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
			history.pushState(null, '', `#${id}`);
		}
	};

	const handleTocClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
		e.preventDefault();
		scrollToId(id);
	};

	return (
		<div className="w-full h-full flex flex-col p-2 sm:p-4 pt-4 pb-4 bg-transparent">
			<TerminalFrame meta={docMeta}>
				<div className="h-full w-full flex gap-0 lg:gap-0">
					{/* ─── Main Scroll Body ─── */}
					<div className="flex-1 min-w-0 relative">
						<div className="absolute inset-0 overflow-y-auto scrollbar-thin scrollbar-track-transparent pr-3 sm:pr-6 pb-12 p-4 sm:p-6 lg:p-8"
							style={{ scrollbarColor: 'color-mix(in oklch, var(--theme-primary) 20%, transparent) transparent' }}
						>
							<div className="max-w-4xl mx-auto">
								<MarkdownRenderer content={content} onNavigate={scrollToId} />
							</div>
						</div>
					</div>

					{/* ─── Table of Contents Sidebar ─── */}
					<aside className="hidden lg:flex w-60 shrink-0 border-l border-white/6">
						<div className="w-full p-5 pt-6 overflow-y-auto max-h-full scrollbar-thin scrollbar-track-transparent"
							style={{ scrollbarColor: 'color-mix(in oklch, var(--theme-primary) 15%, transparent) transparent' }}
						>
							<p
								className="text-[10px] font-bold uppercase tracking-[0.2em] mb-5 flex items-center gap-2 font-mono"
								style={{ color: 'color-mix(in oklch, var(--theme-primary) 75%, white 25%)' }}
							>
								<span
									className="w-1 h-3 rounded-full"
									style={{ background: 'var(--theme-primary)' }}
								/>
								On this page
							</p>
							<nav className="space-y-0.5">
								{toc.slice(0, 60).map(item => (
									<a
										key={item.id}
										href={`#${item.id}`}
										onClick={(e) => handleTocClick(e, item.id)}
										className="block text-[12px] text-white/70 hover:text-white transition-colors py-1 font-mono truncate"
										style={{
											paddingLeft:
												item.depth === 1
													? 0
													: item.depth === 2
														? 12
														: 24,
										}}
									>
										{item.depth > 1 && (
											<span className="text-white/10 mr-1 select-none">
												{item.depth === 2 ? '├' : '└'}
											</span>
										)}
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
