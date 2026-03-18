'use client';

import { Terminal } from 'lucide-react';
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
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-[95vw] xl:max-w-[1400px] mx-auto flex flex-col grow bg-black/80 border border-(--theme-primary)/30 rounded-2xl overflow-hidden shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] font-mono relative backdrop-blur-2xl"
        >
            {/* CRT Scanline Overlay */}
			<div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_4px,3px_100%] z-50 opacity-20" />
			<div className="absolute inset-0 bg-linear-to-b from-(--theme-primary)/10 via-transparent to-transparent opacity-60 blur-2xl pointer-events-none" />

			<div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-3 bg-black/50 border-b border-(--theme-primary)/25 relative z-10 box-border shadow-md">
				<div className="flex items-center gap-4">
                    <Link href="/portfolio" className="px-3 sm:px-4 py-1.5 rounded-lg bg-(--theme-primary)/10 hover:bg-(--theme-primary)/20 text-(--theme-primary) transition-all border border-(--theme-primary)/20 flex items-center gap-2 group">
                        <span className="text-[10px] font-bold uppercase tracking-widest group-hover:-translate-x-1 transition-transform">{'<'} Return</span>
                    </Link>
                    <div className="w-px h-5 bg-white/10" />
                    <div className="flex items-center gap-3" style={{ color: 'var(--theme-primary)' }}>
                        <Terminal className="w-4 h-4" />
                        <span className="text-xs sm:text-sm font-bold tracking-[0.2em] uppercase">
                            {title}
                        </span>
                    </div>
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
				<div className="shrink-0 flex items-center justify-between px-4 sm:px-6 py-2 bg-black/45 border-t border-(--theme-primary)/20 relative z-10 box-border">
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
		</motion.div>
	);
}
