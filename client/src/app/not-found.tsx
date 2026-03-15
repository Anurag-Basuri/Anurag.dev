'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Terminal, Home, Search, ArrowLeft } from 'lucide-react';

// ASCII Art for 404
const ASCII_404 = `
██╗  ██╗ ██████╗ ██╗  ██╗
██║  ██║██╔═══██╗██║  ██║
███████║██║   ██║███████║
╚════██║██║   ██║╚════██║
     ██║╚██████╔╝     ██║
     ╚═╝ ╚═════╝      ╚═╝
`;

// Simulated terminal commands
const TERMINAL_LINES = [
	{ prompt: '~', command: 'find / -name "requested_page"', delay: 0 },
	{ prompt: '~', command: 'echo $?', delay: 800, output: '1' },
	{
		prompt: '~',
		command: 'cat /var/log/error.log | tail -1',
		delay: 1600,
		output: 'ERROR: File or directory not found',
	},
];

export default function NotFound() {
	const [visibleLines, setVisibleLines] = useState(0);
	const [cursorVisible, setCursorVisible] = useState(true);

	// Animate terminal lines
	useEffect(() => {
		const timers: NodeJS.Timeout[] = [];
		TERMINAL_LINES.forEach((line, index) => {
			const timer = setTimeout(() => {
				setVisibleLines(index + 1);
			}, line.delay);
			timers.push(timer);
		});
		return () => timers.forEach(clearTimeout);
	}, []);

	// Blinking cursor
	useEffect(() => {
		const interval = setInterval(() => {
			setCursorVisible(v => !v);
		}, 530);
		return () => clearInterval(interval);
	}, []);

	return (
		<div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 font-mono relative overflow-hidden">
			{/* Subtle grid background */}
			<div
				className="absolute inset-0 opacity-[0.03]"
				style={{
					backgroundImage: 'radial-gradient(circle, #10b981 1px, transparent 1px)',
					backgroundSize: '32px 32px',
				}}
			/>

			{/* Content */}
			<div className="max-w-2xl w-full relative z-10">
				{/* Terminal Window */}
				<div className="bg-black/60 backdrop-blur-xl border border-emerald-500/20 rounded-lg overflow-hidden shadow-[0_0_50px_-10px_rgba(16,185,129,0.3)]">
					{/* Terminal Header */}
					<div className="flex items-center gap-2 px-4 py-3 bg-emerald-900/20 border-b border-emerald-500/20">
						<div className="flex gap-1.5">
							<div className="w-3 h-3 rounded-full bg-red-500/80" />
							<div className="w-3 h-3 rounded-full bg-yellow-500/80" />
							<div className="w-3 h-3 rounded-full bg-green-500/80" />
						</div>
						<div className="flex-1 text-center">
							<span className="text-emerald-500/60 text-xs tracking-wider">
								SYSTEM_ERROR.sh
							</span>
						</div>
						<Terminal className="w-4 h-4 text-emerald-500/40" />
					</div>

					{/* Terminal Body */}
					<div className="p-6 space-y-4">
						{/* ASCII 404 */}
						<pre className="text-emerald-400 text-[10px] sm:text-xs leading-tight text-center select-none overflow-x-auto">
							{ASCII_404}
						</pre>

						{/* Error Message */}
						<div className="text-center py-4">
							<h1 className="text-xl sm:text-2xl font-bold text-white/90 mb-2">
								FILE_NOT_FOUND
							</h1>
							<p className="text-emerald-500/60 text-sm">
								The requested resource could not be located on this server.
							</p>
						</div>

						{/* Terminal Output */}
						<div className="bg-black/40 rounded border border-emerald-500/10 p-4 space-y-2 text-sm">
							{TERMINAL_LINES.slice(0, visibleLines).map((line, index) => (
								<div key={index}>
									<div className="flex gap-2 text-emerald-500/80">
										<span className="text-emerald-600">{line.prompt}</span>
										<span className="text-cyan-400">$</span>
										<span className="text-white/80">{line.command}</span>
									</div>
									{line.output && (
										<div className="text-red-400/80 pl-6">{line.output}</div>
									)}
								</div>
							))}
							{/* Cursor */}
							<div className="flex gap-2 text-emerald-500/80">
								<span className="text-emerald-600">~</span>
								<span className="text-cyan-400">$</span>
								<span
									className={`w-2 h-4 bg-emerald-500 ${
										cursorVisible ? 'opacity-100' : 'opacity-0'
									}`}
								/>
							</div>
						</div>

						{/* Actions */}
						<div className="flex flex-wrap items-center justify-center gap-3 pt-4">
							<Link
								href="/portfolio"
								className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all duration-300 border border-emerald-500/30 font-medium text-sm hover:scale-105"
							>
								<Home className="w-4 h-4" />
								cd /home
							</Link>
							<button
								onClick={() => window.history.back()}
								className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-all duration-300 border border-white/10 font-medium text-sm hover:scale-105"
							>
								<ArrowLeft className="w-4 h-4" />
								cd ..
							</button>
						</div>
					</div>
				</div>

				{/* Footer hint */}
				<p className="text-center text-emerald-500/30 text-xs mt-6 tracking-widest uppercase">
					Press [SPACE] or click to navigate
				</p>
			</div>
		</div>
	);
}

