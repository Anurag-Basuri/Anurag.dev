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
					className="h-full w-full flex flex-col items-center justify-center text-muted-foreground select-none p-4 sm:p-6 md:p-12 overflow-auto"
				>
					{/* Hero Section */}
					<div className="relative mb-6 md:mb-8 group">
						<div className="absolute -inset-10 bg-emerald-500/20 rounded-full blur-3xl animate-pulse opacity-50 group-hover:opacity-80 transition-opacity duration-1000" />
						<div className="relative bg-[#0d1117]/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl border border-white/10 shadow-[0_0_50px_-10px_rgba(16,185,129,0.3)] ring-1 ring-white/5">
							<Command className="w-12 h-12 md:w-16 md:h-16 text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
						</div>
					</div>

					{/* Welcome Message */}
					<div className="text-center mb-6 md:mb-8 max-w-2xl">
						<h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 md:mb-4">
							<span className="bg-clip-text text-transparent bg-linear-to-r from-emerald-400 to-blue-500">
								Hi, I'm Anurag
							</span>
						</h1>
						<p className="text-lg sm:text-xl md:text-2xl font-semibold text-white/80 mb-2 md:mb-3">
							Full Stack Engineer
						</p>
						<p className="text-sm sm:text-base md:text-lg text-white/50 font-mono">
							Building the Future with Code & AI
						</p>
					</div>

					{/* Key Info Cards */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full max-w-4xl mb-6 md:mb-8 pointer-events-auto">
						{/* About Card */}
						<div className="flex flex-col gap-2 p-4 sm:p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300 group cursor-default">
							<div className="flex items-center gap-2 text-emerald-400 mb-1">
								<div className="p-2 rounded-lg bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
									<MousePointer2 className="w-4 h-4" />
								</div>
								<span className="text-xs sm:text-sm font-bold uppercase tracking-widest">
									About Me
								</span>
							</div>
							<p className="text-xs sm:text-sm text-white/60 leading-relaxed">
								Learn about my background, skills, and interests. Click{' '}
								<span className="text-emerald-400 font-medium">About</span> in the
								sidebar.
							</p>
						</div>

						{/* Projects Card */}
						<div className="flex flex-col gap-2 p-4 sm:p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all duration-300 group cursor-default">
							<div className="flex items-center gap-2 text-blue-400 mb-1">
								<div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
									<Command className="w-4 h-4" />
								</div>
								<span className="text-xs sm:text-sm font-bold uppercase tracking-widest">
									My Work
								</span>
							</div>
							<p className="text-xs sm:text-sm text-white/60 leading-relaxed">
								Explore my portfolio of projects. Find{' '}
								<span className="text-blue-400 font-medium">Projects</span> and{' '}
								<span className="text-blue-400 font-medium">Journey</span> in the
								sidebar.
							</p>
						</div>

						{/* Contact Card */}
						<div className="flex flex-col gap-2 p-4 sm:p-5 rounded-2xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 group cursor-default sm:col-span-2 lg:col-span-1">
							<div className="flex items-center gap-2 text-purple-400 mb-1">
								<div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
									<MousePointer2 className="w-4 h-4" />
								</div>
								<span className="text-xs sm:text-sm font-bold uppercase tracking-widest">
									Get In Touch
								</span>
							</div>
							<p className="text-xs sm:text-sm text-white/60 leading-relaxed">
								Ready to collaborate? Open{' '}
								<span className="text-purple-400 font-medium">Contact</span> to
								reach out.
							</p>
						</div>
					</div>

					{/* Navigation Hint */}
					<div className="text-center max-w-md mb-4 md:mb-6">
						<p className="text-xs sm:text-sm text-white/40 leading-relaxed">
							<span className="text-emerald-400 font-semibold">💡 Tip:</span> Use the{' '}
							<span className="text-white/60 font-medium">sidebar</span> on the left
							to navigate, or try the{' '}
							<span className="text-white/60 font-medium">terminal</span> below (type{' '}
							<span className="font-mono text-white/80 bg-white/5 px-1 rounded">
								help
							</span>
							).
						</p>
					</div>

					{/* System Status Footer */}
					<div className="mt-auto flex flex-col sm:flex-row items-center gap-2 sm:gap-3 md:gap-6 text-[10px] font-mono text-white/20 uppercase tracking-widest">
						<div className="flex items-center gap-2">
							<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
							<span>AnuragOS v2.0</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
							<span>System Ready</span>
						</div>
						<div className="flex items-center gap-2">
							<div className="w-1.5 h-1.5 rounded-full bg-white/50" />
							<span>All Systems Operational</span>
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
