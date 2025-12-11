'use client';

import { useAtom } from 'jotai';
import { windowsAtom } from '@/store/atoms';
import { WindowFrame } from './WindowFrame';

import { motion } from 'framer-motion';
import { Command, MousePointer2 } from 'lucide-react';

export function EditorArea() {
	const [windows] = useAtom(windowsAtom);

	return (
		<div id="editor-boundary" className="h-full w-full relative group">
			<div
				className="absolute inset-0 pointer-events-none opacity-[1]"
			/>

			{windows.length === 0 ? (
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
					className="h-full w-full flex flex-col items-center justify-center text-muted-foreground select-none pointer-events-none"
				>
					<div className="relative mb-8">
						<div className="absolute -inset-8 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
						<div className="relative bg-[#0d1117]/50 p-6 rounded-2xl border border-white/5 ring-1 ring-white/10 shadow-2xl">
							<Command className="w-12 h-12 text-emerald-500/80" />
						</div>
					</div>

					<h3 className="text-2xl font-semibold text-white/90 mb-3 tracking-tight">
						No Files Open
					</h3>

					<p className="text-sm text-white/40 max-w-xs text-center leading-relaxed mb-8">
						Select a file from the explorer on the left or use the terminal below to
						navigate.
					</p>

					<div className="flex flex-col gap-3">
						<div className="flex items-center gap-3 text-xs font-mono text-white/30 bg-white/5 px-4 py-2 rounded-full border border-white/5">
							<div className="flex items-center gap-1.5">
								<span className="px-1.5 py-0.5 rounded bg-white/10 min-w-[20px] text-center text-white/70">
									⌘
								</span>
								<span>+</span>
								<span className="px-1.5 py-0.5 rounded bg-white/10 min-w-[20px] text-center text-white/70">
									P
								</span>
							</div>
							<span className="text-white/20">|</span>
							<span>Quick Search</span>
						</div>
					</div>
				</motion.div>
			) : (
				windows.map(window => (
					<WindowFrame key={window.id} windowState={window} bounds="#editor-boundary" />
				))
			)}
		</div>
	);
}
