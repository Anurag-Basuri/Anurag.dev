'use client';

import { useAtom } from 'jotai';
import { windowsAtom, activeWindowIdAtom } from '@/store/atoms';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	Terminal,
	AppWindow,
	Wifi,
	Battery,
	Volume2,
	Power,
	Settings,
	User,
	ChevronRight,
} from 'lucide-react';
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
		<div className="h-10 bg-[#050505] border-t border-[#333] flex items-center px-2 z-50 relative select-none font-mono text-sm">
			{/* Start Button */}
			<div className="relative">
				<button
					onClick={() => setIsStartOpen(!isStartOpen)}
					className={cn(
						'px-3 py-1 hover:bg-[#111] hover:text-[#00ff41] transition-colors flex items-center gap-2 border border-transparent hover:border-[#333]',
						isStartOpen && 'bg-[#111] text-[#00ff41] border-[#333]',
					)}
				>
					<Terminal className="w-4 h-4" />
					<span className="font-bold hidden md:block">SYSTEM</span>
				</button>

				{/* Start Menu */}
				<AnimatePresence>
					{isStartOpen && (
						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 10 }}
							className="absolute bottom-12 left-0 w-64 bg-[#050505] border border-[#333] shadow-[0_0_20px_rgba(0,255,65,0.1)] p-1"
						>
							<div className="bg-[#111] p-3 border-b border-[#333] mb-1">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 bg-[#00ff41] text-black flex items-center justify-center font-bold">
										A
									</div>
									<div>
										<div className="font-bold text-[#00ff41]">ANURAG.USR</div>
										<div className="text-[10px] text-[#666]">LEVEL 99 DEV</div>
									</div>
								</div>
							</div>

							<div className="space-y-0.5">
								{['PROJECTS', 'ABOUT', 'CONTACT', 'JOURNEY'].map(item => (
									<button
										key={item}
										className="w-full text-left px-3 py-2 hover:bg-[#00ff41] hover:text-black text-[#ccc] transition-colors text-xs flex items-center justify-between group"
									>
										<span className="flex items-center gap-2">
											<ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100" />
											{item}
										</span>
										<span className="text-[10px] opacity-50">EXE</span>
									</button>
								))}
							</div>

							<div className="mt-1 pt-1 border-t border-[#333] grid grid-cols-2 gap-0.5">
								<button className="px-3 py-2 hover:bg-[#111] text-[#666] hover:text-[#ccc] text-xs flex items-center gap-2 transition-colors">
									<Settings className="w-3 h-3" />
									CONFIG
								</button>
								<button className="px-3 py-2 hover:bg-[#ff0033] hover:text-white text-[#ff0033] text-xs flex items-center gap-2 transition-colors">
									<Power className="w-3 h-3" />
									HALT
								</button>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Window Tabs */}
			<div className="flex-1 flex items-center gap-1 overflow-x-auto px-4">
				{windows.map(window => (
					<button
						key={window.id}
						onClick={() => handleWindowClick(window.id)}
						className={cn(
							'px-3 py-1 flex items-center gap-2 min-w-[100px] max-w-[180px] transition-all border text-xs',
							activeId === window.id && !window.isMinimized
								? 'bg-[#111] border-[#333] text-[#00ff41] shadow-[inset_0_0_10px_rgba(0,255,65,0.05)]'
								: 'hover:bg-[#111] text-[#666] border-transparent hover:border-[#333]',
						)}
					>
						<span className="truncate">{window.title}</span>
					</button>
				))}
			</div>

			{/* System Tray */}
			<div className="flex items-center gap-4 px-4 border-l border-[#333] ml-2 text-[#666]">
				<div className="items-center gap-3 hidden md:flex">
					<div className="flex items-center gap-1 text-[10px]">
						<span className="text-[#00ff41]">CPU</span>
						<span>12%</span>
					</div>
					<div className="flex items-center gap-1 text-[10px]">
						<span className="text-[#00ff41]">MEM</span>
						<span>4.2GB</span>
					</div>
				</div>
				<div className="text-right">
					<div className="text-xs font-medium text-[#00ff41]">
						{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
					</div>
				</div>
			</div>
		</div>
	);
}
