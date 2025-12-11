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
			<div className="absolute inset-0 pointer-events-none opacity-[1]" />

			{windows.length === 0 ? (
				<motion.div
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
					className="h-full w-full flex flex-col items-center justify-center text-muted-foreground select-none pointer-events-none p-8"
				>
					<div className="relative mb-8">
						<div className="absolute -inset-8 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
						<div className="relative bg-[#0d1117]/50 p-6 rounded-2xl border border-white/5 ring-1 ring-white/10 shadow-2xl">
							<Command className="w-12 h-12 text-emerald-500/80" />
						</div>
					</div>

					<h3 className="text-2xl font-semibold text-white/90 mb-3 tracking-tight">
						Welcome to Anurag's Portfolio
					</h3>

					<p className="text-sm text-white/40 max-w-md text-center leading-relaxed mb-10">
						A developer-first portfolio experience. Navigate using the file explorer,
						terminal, or keyboard shortcuts.
					</p>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-lg">
						{/* Quick Action Cards */}
						<div className="flex flex-col gap-1 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
							<div className="flex items-center gap-2 text-emerald-400 mb-1">
								<MousePointer2 className="w-4 h-4" />
								<span className="text-xs font-medium uppercase tracking-wider">
									Explore
								</span>
							</div>
							<p className="text-sm text-white/70">
								Click on <span className="text-white font-medium">projects</span>{' '}
								folder to see my work
							</p>
						</div>

						<div className="flex flex-col gap-1 p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
							<div className="flex items-center gap-2 text-blue-400 mb-1">
								<Command className="w-4 h-4" />
								<span className="text-xs font-medium uppercase tracking-wider">
									Terminal
								</span>
							</div>
							<p className="text-sm text-white/70">
								Type{' '}
								<span className="font-mono text-xs bg-white/10 px-1 py-0.5 rounded">
									help
								</span>{' '}
								to see available commands
							</p>
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
