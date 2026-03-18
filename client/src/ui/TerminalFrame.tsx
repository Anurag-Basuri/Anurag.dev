'use client';

import { Terminal } from 'lucide-react';
import type { ReadmeDocMeta } from '@/readme/types';

export function TerminalFrame({
	title = 'SYS_DOC // README.MD',
	meta,
	children,
}: {
	title?: string;
	meta?: ReadmeDocMeta;
	children: React.ReactNode;
}) {
	return (
		<div className="w-full max-w-6xl mx-auto flex flex-col grow bg-black/70 border border-[color:var(--theme-primary)]/25 rounded-xl overflow-hidden shadow-[0_0_30px_-5px_rgba(0,0,0,0.35)] font-mono relative backdrop-blur-xl">
			<div className="absolute inset-0 bg-linear-to-b from-[color:var(--theme-primary)]/10 via-transparent to-transparent opacity-50 blur-xl pointer-events-none" />

			<div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 bg-black/35 border-b border-[color:var(--theme-primary)]/15 relative z-10 box-border">
				<div className="flex items-center gap-3" style={{ color: 'var(--theme-primary)' }}>
					<Terminal className="w-4 h-4" />
					<span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase">
						{title}
					</span>
				</div>

				{meta && (
					<div className="text-[10px] text-white/55 font-mono hidden md:flex items-center gap-6">
						<span className="flex items-center gap-1.5">
							<span
								className="w-1.5 h-1.5 rounded-full"
								style={{ background: 'var(--theme-secondary)', opacity: 0.6 }}
							/>
							SIZE: {(meta.sizeBytes / 1024).toFixed(2)} KB
						</span>
						<span className="flex items-center gap-1.5">
							<span
								className="w-1.5 h-1.5 rounded-full"
								style={{ background: 'var(--theme-primary)', opacity: 0.6 }}
							/>
							LINES: {meta.lines}
						</span>
						<span className="flex items-center gap-1.5">
							<span
								className="w-1.5 h-1.5 rounded-full"
								style={{ background: 'var(--theme-primary)', opacity: 0.4 }}
							/>
							WORDS: {meta.words}
						</span>
					</div>
				)}
			</div>

			<div className="flex-1 min-h-0 relative z-10">{children}</div>

			{meta && (
				<div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-2 bg-black/45 border-t border-[color:var(--theme-primary)]/20 relative z-10 box-border">
					<div className="flex items-center gap-3">
						<span
							className="w-1.5 h-1.5 rounded-full animate-pulse"
							style={{
								background: 'var(--theme-primary)',
								boxShadow: '0 0 10px color-mix(in oklch, var(--theme-primary) 70%, transparent)',
							}}
						/>
						<span className="text-[9px] text-white/55 font-mono tracking-[0.2em]">
							CONNECTION_SECURE
						</span>
					</div>
					<div className="text-[9px] text-white/45 font-mono uppercase tracking-[0.2em]">
						SYNC: {new Date(meta.lastModified).toLocaleTimeString()}
					</div>
				</div>
			)}
		</div>
	);
}

