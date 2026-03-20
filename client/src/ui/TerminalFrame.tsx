'use client';

import { Terminal, ArrowLeft } from 'lucide-react';
import type { ReadmeDocMeta } from '@/readme/types';
import { motion } from 'framer-motion';
import Link from 'next/link';

export function TerminalFrame({
	title = 'README.md',
	meta,
	children,
}: {
	title?: string;
	meta?: ReadmeDocMeta;
	children: React.ReactNode;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20, scale: 0.98 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
			className="w-full max-w-[96vw] xl:max-w-[1440px] mx-auto flex flex-col grow rounded-2xl overflow-hidden relative font-mono content-panel-transparent shadow-(--shadow-premium)"
		>
			{/* Subtle top-edge highlight */}
			<div
				className="absolute top-0 inset-x-0 h-px z-20 pointer-events-none"
				style={{ background: 'linear-gradient(90deg, transparent, color-mix(in oklch, var(--theme-primary) 30%, transparent), transparent)' }}
			/>

			{/* ─── Title Bar ─── */}
			<div className="shrink-0 flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 border-b border-border relative z-10">
				{/* Left: nav + title */}
				<div className="flex items-center gap-3">
					<Link
						href="/portfolio"
						className="flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-all group"
					>
						<ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
						<span className="text-[11px] font-medium tracking-wide">Portfolio</span>
					</Link>

					<div className="w-px h-4 bg-border" />

					<div className="flex items-center gap-2">
						<Terminal className="w-3.5 h-3.5" style={{ color: 'var(--theme-primary)' }} />
						<span className="text-[12px] font-medium tracking-wide text-muted-foreground">
							{title}
						</span>
					</div>
				</div>

				{/* Right: file metadata */}
				{meta && (
					<div className="text-[10px] text-muted-foreground hidden md:flex items-center gap-5 font-mono">
						<span>{(meta.sizeBytes / 1024).toFixed(1)} KB</span>
						<span>{meta.lines} lines</span>
						<span>{meta.words} words</span>
						<span className="flex items-center gap-1.5">
							<span
								className="w-1.5 h-1.5 rounded-full animate-pulse"
								style={{ background: 'var(--theme-primary)', boxShadow: '0 0 6px color-mix(in oklch, var(--theme-primary) 60%, transparent)' }}
							/>
							synced
						</span>
					</div>
				)}
			</div>

			{/* ─── Content Area ─── */}
			<div className="flex-1 min-h-0 relative z-10">{children}</div>

			{/* ─── Status Bar ─── */}
			{meta && (
				<div className="shrink-0 flex items-center justify-between px-3 sm:px-4 py-1 border-t border-border relative z-10">
					<div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
						<span style={{ color: 'var(--theme-primary)' }}>●</span>
						<span>UTF-8</span>
						<span className="opacity-30">│</span>
						<span>Markdown</span>
					</div>
					<div className="text-[10px] text-muted-foreground font-mono">
						Last sync: {new Date(meta.lastModified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
					</div>
				</div>
			)}
		</motion.div>
	);
}
