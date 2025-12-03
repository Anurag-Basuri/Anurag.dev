'use client';

import { useAtom } from 'jotai';
import { windowsAtom, activeWindowIdAtom } from '@/store/atoms';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, AppWindow, Wifi, Battery, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Taskbar() {
	const [windows, setWindows] = useAtom(windowsAtom);
	const [activeId, setActiveId] = useAtom(activeWindowIdAtom);
	const [time, setTime] = useState(new Date());
	const [isStartOpen, setIsStartOpen] = useState(false);

	useEffect(() => {
		const timer = setInterval(() => setTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);

	const handleWindowClick = (id: string) => {
		const window = windows.find(w => w.id === id);
		if (window?.isMinimized) {
			setWindows(prev => prev.map(w => (w.id === id ? { ...w, isMinimized: false } : w)));
			setActiveId(id);
		} else if (activeId === id) {
			setWindows(prev => prev.map(w => (w.id === id ? { ...w, isMinimized: true } : w)));
		} else {
			setActiveId(id);
		}
	};

	return (
		<div className="h-12 bg-background/90 backdrop-blur-md border-t border-border flex items-center px-2 z-50 relative select-none shadow-lg transition-colors duration-300">
			{/* Start Button */}
			<div className="relative">
				<button
					onClick={() => setIsStartOpen(!isStartOpen)}
					className={cn(
						'p-2 rounded hover:bg-muted transition-colors flex items-center gap-2 mr-2',
						isStartOpen && 'bg-muted',
					)}
				>
					<div className="w-6 h-6 bg-linear-to-br from-emerald-500 to-blue-600 dark:from-emerald-400 dark:to-blue-500 rounded-sm flex items-center justify-center shadow-lg shadow-emerald-500/20">
						<Terminal className="w-4 h-4 text-white" />
					</div>
					<span className="font-bold text-foreground text-sm hidden md:block">Start</span>
				</button>

				{/* Start Menu */}
				<AnimatePresence>
					{isStartOpen && (
						<motion.div
							initial={{ opacity: 0, y: 10, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 10, scale: 0.95 }}
							className="absolute bottom-14 left-0 w-64 bg-popover/95 backdrop-blur-xl border border-border rounded-lg shadow-2xl p-4 overflow-hidden"
						>
							<div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
								<div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-500 to-blue-600 dark:from-emerald-400 dark:to-blue-500 flex items-center justify-center">
									<span className="text-white font-bold text-lg">A</span>
								</div>
								<div>
									<div className="font-bold text-foreground">Anurag User</div>
									<div className="text-xs text-muted-foreground">Developer</div>
								</div>
							</div>

							<div className="space-y-1">
								{['Projects', 'About', 'Contact', 'Journey'].map(item => (
									<button
										key={item}
										className="w-full text-left px-3 py-2 rounded hover:bg-muted text-foreground hover:text-primary transition-colors text-sm flex items-center gap-2"
									>
										<AppWindow className="w-4 h-4" />
										{item}
									</button>
								))}
							</div>

							<div className="mt-4 pt-4 border-t border-border flex justify-between">
								<button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
									Settings
								</button>
								<button className="text-xs text-destructive hover:text-destructive/80 transition-colors">
									Shut Down
								</button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Window Tabs */}
			<div className="flex-1 flex items-center gap-1 overflow-x-auto px-2">
				{windows.map(window => (
					<button
						key={window.id}
						onClick={() => handleWindowClick(window.id)}
						className={cn(
							'px-3 py-1.5 rounded flex items-center gap-2 min-w-[120px] max-w-[200px] transition-all border',
							activeId === window.id && !window.isMinimized
								? 'bg-muted border-primary/30 shadow-inner'
								: 'hover:bg-muted/50 text-muted-foreground border-transparent',
						)}
					>
						<AppWindow className="w-4 h-4 text-primary" />
						<span className="text-xs truncate text-foreground">{window.title}</span>
					</button>
				))}
			</div>

			{/* System Tray */}
			<div className="flex items-center gap-4 px-2 pl-4 border-l border-border ml-2">
				<div className="items-center gap-2 text-muted-foreground hidden md:flex">
					<Wifi className="w-4 h-4" />
					<Volume2 className="w-4 h-4" />
					<Battery className="w-4 h-4" />
				</div>
				<div className="text-right">
					<div className="text-xs font-medium text-foreground">
						{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
					</div>
					<div className="text-[10px] text-muted-foreground hidden md:block">
						{time.toLocaleDateString()}
					</div>
				</div>
			</div>
		</div>
	);
}
