'use client';

import { useAtom } from 'jotai';
import { windowsAtom } from '@/store';
import { WindowFrame } from './WindowFrame';

import { motion, AnimatePresence } from 'framer-motion';
import { Command, MousePointer2 } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { useWindowManager } from '@/hooks/use-window-manager';

export function EditorArea() {
	const [windows] = useAtom(windowsAtom);

	return (
		<div id="editor-boundary" className="h-full w-full relative group">
			<div className="absolute inset-0 pointer-events-none opacity-[1]" />

			<AnimatePresence mode="wait">
				{(windows.length === 0 || windows.every(w => w.isMinimized)) && (
					<motion.div
						key="dashboard"
						initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
						animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
						exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
						transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
						className="absolute inset-0 h-full w-full flex flex-col items-center justify-center text-muted-foreground select-none p-4 sm:p-6 md:p-12 overflow-hidden z-0"
					>
						{/* Background Glow */}
						<div className="absolute inset-0 pointer-events-none overflow-hidden">
							<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px]" />
							<div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px]" />
						</div>

						{/* Live Clock Widget */}
						<div className="mb-12 relative z-10">
							<LiveClock />
						</div>

						{/* Hero Section */}
						<div className="relative mb-8 group z-10 text-center">
							<div className="flex items-center justify-center mb-6">
								<div className="relative group/icon cursor-default">
									<div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl opacity-0 group-hover/icon:opacity-100 transition-opacity duration-500" />
									<div className="relative bg-background/40 backdrop-blur-xl p-5 rounded-2xl border border-white/10 shadow-2xl ring-1 ring-white/5 group-hover/icon:scale-105 transition-transform duration-300">
										<Command className="w-10 h-10 text-primary" />
									</div>
								</div>
							</div>

							<h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 tracking-tight">
								<span className="bg-clip-text text-transparent bg-linear-to-b from-white to-white/60">
									AnuragOS
								</span>
							</h1>
							<p className="text-lg text-white/40 font-medium tracking-wide uppercase text-[10px] sm:text-xs">
								Personal Portfolio Environment
							</p>
						</div>

						{/* Quick Actions Grid */}
						<div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-2xl px-4 relative z-10">
							<QuickAction
								icon={MousePointer2}
								label="About Me"
								desc="Bio & Resume"
								color="emerald"
								moduleId="about"
							/>
							<QuickAction
								icon={Command}
								label="Projects"
								desc="Recent Work"
								color="blue"
								moduleId="projects"
							/>
							<QuickAction
								icon={MousePointer2}
								label="Contact"
								desc="Get in Touch"
								color="purple"
								moduleId="contact"
							/>
						</div>

						{/* System Status Footer */}
						<div className="absolute bottom-6 left-0 right-0 flex justify-center">
							<div className="flex items-center gap-6 text-[10px] font-mono text-white/20 uppercase tracking-widest bg-black/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/5">
								<div className="flex items-center gap-2">
									<div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
									<span>System Online</span>
								</div>
								<div className="flex items-center gap-2">
									<div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
									<span>v2.4.0</span>
								</div>
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Windows Layer - Always rendered, they handle their own internal visibility/minimization */}
			{windows.map(window => (
				<WindowFrame key={window.id} windowState={window} bounds="#editor-boundary" />
			))}
		</div>
	);
}

// Live Clock Component
function LiveClock() {
	const [time, setTime] = React.useState<Date | null>(null);

	React.useEffect(() => {
		setTime(new Date());
		const timer = setInterval(() => setTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	if (!time) return <div className="h-20" />; // Prevent hydration mismatch

	return (
		<div className="flex flex-col items-center">
			<div className="text-6xl sm:text-7xl md:text-8xl font-bold text-white/10 tracking-tighter tabular-nums select-none hover:text-white/20 transition-colors cursor-default">
				{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
			</div>
			<div className="text-lg text-white/20 font-medium tracking-widest uppercase mt-2">
				{time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
			</div>
		</div>
	);
}

// Quick Action Component
function QuickAction({
	icon: Icon,
	label,
	desc,
	color,
	moduleId,
}: {
	icon: React.ComponentType<{ className?: string }>;
	label: string;
	desc: string;
	color: string;
	moduleId: string;
}) {
	const { openWindow } = useWindowManager();

	const colorClasses: Record<string, string> = {
		emerald: 'text-primary group-hover:bg-primary/20 group-hover:border-primary/30',
		blue: 'text-blue-400 group-hover:bg-blue-500/20 group-hover:border-blue-500/30',
		purple: 'text-purple-400 group-hover:bg-purple-500/20 group-hover:border-purple-500/30',
	};

	return (
		<button
			onClick={() => openWindow(moduleId)}
			className={cn(
				'flex flex-col gap-3 p-5 rounded-2xl border border-white/5 bg-white/5 transition-all duration-300 group text-left relative overflow-hidden',
				'hover:-translate-y-1 hover:shadow-xl',
				colorClasses[color],
			)}
		>
			<div className="p-3 rounded-xl bg-white/5 w-fit group-hover:scale-110 transition-transform duration-300">
				<Icon
					className={cn(
						'w-5 h-5',
						color === 'emerald' && 'text-emerald-400',
						color === 'blue' && 'text-blue-400',
						color === 'purple' && 'text-purple-400',
					)}
				/>
			</div>
			<div>
				<div className="font-bold text-white/90 mb-1">{label}</div>
				<div className="text-xs text-white/50 group-hover:text-white/70 transition-colors">
					{desc}
				</div>
			</div>
		</button>
	);
}
