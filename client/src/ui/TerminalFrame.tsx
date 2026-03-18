'use client';

import { FileText, ArrowLeft } from 'lucide-react';
import type { ReadmeDocMeta } from '@/readme/types';
import { motion } from 'framer-motion';
import Link from 'next/link';

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
		<motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[95vw] xl:max-w-[1400px] mx-auto flex flex-col grow bg-[#0a0a0a] border border-white/10 rounded-xl overflow-hidden shadow-2xl relative font-sans"
        >
			{/* Clean Window Header */}
			<div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 bg-[#111111] border-b border-white/5 relative z-10 box-border">
				<div className="flex items-center gap-4">
                    <Link href="/portfolio" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                        <span className="text-xs font-medium">Portfolio</span>
                    </Link>
                    <div className="w-px h-4 bg-white/10" />
                    <div className="flex items-center gap-2 text-zinc-300">
                        <FileText className="w-4 h-4 text-zinc-500" />
                        <span className="text-sm font-medium tracking-tight">
                            {title}
                        </span>
                    </div>
                </div>

				{meta && (
					<div className="text-[11px] text-zinc-500 font-mono hidden md:flex items-center gap-6">
						<span>Size: {(meta.sizeBytes / 1024).toFixed(2)} KB</span>
						<span>Lines: {meta.lines}</span>
						<span>Words: {meta.words}</span>
						<span className="flex items-center gap-1.5 pl-4 border-l border-white/10 text-zinc-400 py-1">
							<span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
							Live Sync
						</span>
					</div>
				)}
			</div>

			<div className="flex-1 min-h-0 relative z-10 bg-[#0a0a0a]">{children}</div>
		</motion.div>
	);
}
