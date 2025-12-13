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
					transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
					className="h-full w-full flex flex-col items-center justify-center text-muted-foreground select-none pointer-events-none p-6 md:p-12"
				>
					{/* Hero Section */}
					<div className="relative mb-8 md:mb-12 group">
						<div className="absolute -inset-10 bg-emerald-500/20 rounded-full blur-3xl animate-pulse opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />
						<div className="relative bg-[#0d1117]/80 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_-10px_rgba(16,185,129,0.3)] ring-1 ring-white/5">
							<Command className="w-16 h-16 md:w-20 md:h-20 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
						</div>
					</div>

					<h3 className="text-2xl sm:text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-linear-to-r from-emerald-400 to-blue-500 mb-4 tracking-tight text-center">
						AnuragOS{' '}
						<span className="text-white/20 text-lg sm:text-2xl font-mono align-top">
							v2.0
						</span>
					</h3>

					<p className="text-xs sm:text-sm md:text-base text-white/50 max-w-md text-center leading-relaxed mb-8 md:mb-12 px-4 font-mono">
						Secure Environment • System Active • Awaiting Input
					</p>

					{/* Quick Actions Grid */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl pointer-events-auto">
						<div className="flex flex-col gap-3 p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 group cursor-default">
							<div className="flex items-center gap-3 text-emerald-400 mb-1">
								<div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
									<MousePointer2 className="w-5 h-5" />
								</div>
								<span className="text-sm font-bold uppercase tracking-widest">
									Explore
								</span>
							</div>
							<p className="text-sm text-white/60 leading-relaxed">
								Navigate the system using the{' '}
								<span className="text-emerald-400 font-medium">
									Project Directory
								</span>{' '}
								to view portfolio artifacts.
							</p>
						</div>

						{/* Hide Terminal card on very small screens since CLI isn't visible */}
						<div className="hidden sm:flex flex-col gap-3 p-6 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300 group cursor-default">
							<div className="flex items-center gap-3 text-blue-400 mb-1">
								<div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
									<Command className="w-5 h-5" />
								</div>
								<span className="text-sm font-bold uppercase tracking-widest">
									Terminal
								</span>
							</div>
							<p className="text-sm text-white/60 leading-relaxed">
								Execute commands via the{' '}
								<span className="text-blue-400 font-mono text-xs bg-blue-500/10 px-1 py-0.5 rounded border border-blue-500/20">
									CLI
								</span>{' '}
								for deeper system access. Type{' '}
								<span className="text-white">help</span> to begin.
							</p>
						</div>
					</div>

					{/* System Status Footer - Stack on mobile */}
					<div className="mt-8 md:mt-16 flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-[10px] font-mono text-white/20 uppercase tracking-widest">
						<div className="flex items-center gap-2">
							<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
							<span>Kernel: Stable</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
							<span>Uptime: 99.9%</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-1.5 h-1.5 rounded-full bg-white/50" />
							<span>Mem: Optimal</span>
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
