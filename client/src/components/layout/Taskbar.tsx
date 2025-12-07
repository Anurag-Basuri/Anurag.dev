'use client';

import { useAtom } from 'jotai';
import { windowsAtom, activeWindowIdAtom } from '@/store/atoms';
import { getModuleComponent } from '@/lib/moduleRegistry';
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
import { toast } from 'react-hot-toast';

export function Taskbar() {
	const [windows, setWindows] = useAtom(windowsAtom);
	const [activeId, setActiveId] = useAtom(activeWindowIdAtom);
	const [time, setTime] = useState<Date | null>(null);
	const [isStartOpen, setIsStartOpen] = useState(false);

	useEffect(() => {
		setTime(new Date());
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

	const handleOpenModule = (id: string, title: string) => {
		setIsStartOpen(false);
		setWindows(prev => {
			if (prev.find(w => w.id === id)) {
				setActiveId(id);
				return prev;
			}
			setActiveId(id);
			return [
				...prev,
				{
					id,
					title: title.toUpperCase(),
					component: getModuleComponent(id),
					isOpen: true,
					isMinimized: false,
				},
			];
		});
	};

	return (
		<div className="h-10 bg-background/95 backdrop-blur-xl border-t border-border/60 flex items-center px-2 z-50 relative select-none font-mono text-sm shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
			{/* Start Button */}
			<div className="relative">
				<button
					onClick={() => setIsStartOpen(!isStartOpen)}
					className={cn(
						'px-3 py-1 hover:bg-primary/10 hover:text-primary transition-all duration-200 flex items-center gap-2 border border-transparent hover:border-primary/20 rounded-sm',
						isStartOpen &&
							'bg-primary/15 text-primary border-primary/30 shadow-[0_0_15px_rgba(var(--primary),0.15)]',
					)}
				>
					<Terminal className="w-4 h-4" />
					<span className="font-bold hidden md:block">SYSTEM</span>
				</button>

				{/* Start Menu */}
				<AnimatePresence>
					{isStartOpen && (
						<motion.div
							initial={{ opacity: 0, y: 10, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 10, scale: 0.95 }}
							transition={{ duration: 0.2 }}
							className="absolute bottom-12 left-0 w-64 glass-premium border border-border/50 shadow-[0_0_40px_rgba(0,0,0,0.4)] p-1 rounded-lg overflow-hidden"
						>
							<div className="bg-muted/50 p-3 border-b border-border/50 mb-1 backdrop-blur-md">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center font-bold rounded shadow-[0_0_10px_rgba(var(--primary),0.4)]">
										A
									</div>
									<div>
										<div className="font-bold text-primary drop-shadow-[0_0_5px_rgba(var(--primary),0.3)]">
											ANURAG.USR
										</div>
										<div className="text-[10px] text-muted-foreground">
											LEVEL 99 DEV
										</div>
									</div>
								</div>
							</div>

							<div className="space-y-0.5">
								{[
									{ id: 'projects', label: 'PROJECTS' },
									{ id: 'about', label: 'ABOUT' },
									{ id: 'contact', label: 'CONTACT' },
									{ id: 'journey', label: 'JOURNEY' },
								].map(item => (
									<button
										key={item.id}
										onClick={() => handleOpenModule(item.id, item.label)}
										className="w-full text-left px-3 py-2 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all duration-200 text-xs flex items-center justify-between group rounded-sm"
									>
										<span className="flex items-center gap-2">
											<ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
											{item.label}
										</span>
										<span className="text-[10px] opacity-50 group-hover:opacity-80">
											EXE
										</span>
									</button>
								))}
							</div>

							<div className="mt-1 pt-1 border-t border-border/50 grid grid-cols-2 gap-0.5">
								<button
									onClick={() =>
										toast('Configure settings in next version', { icon: '⚙️' })
									}
									className="px-3 py-2 hover:bg-muted/50 text-muted-foreground hover:text-foreground text-xs flex items-center gap-2 transition-colors rounded-sm"
								>
									<Settings className="w-3 h-3" />
									CONFIG
								</button>
								<button
									onClick={() => window.location.reload()}
									className="px-3 py-2 hover:bg-destructive/20 hover:text-destructive text-destructive/80 text-xs flex items-center gap-2 transition-colors rounded-sm"
								>
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
							'px-3 py-1 flex items-center gap-2 min-w-[100px] max-w-[180px] transition-all duration-200 border text-xs rounded-sm',
							activeId === window.id && !window.isMinimized
								? 'bg-primary/10 border-primary/30 text-primary shadow-[inset_0_0_10px_rgba(var(--primary),0.05)]'
								: 'hover:bg-muted/20 text-muted-foreground border-transparent hover:border-border/50',
						)}
					>
						<span className="truncate">{window.title}</span>
					</button>
				))}
			</div>

			{/* System Tray */}
			<div className="flex items-center gap-4 px-4 border-l border-border/50 ml-2 text-muted-foreground">
				<div className="items-center gap-3 hidden md:flex">
					<div className="flex items-center gap-1 text-[10px]">
						<span className="text-primary">CPU</span>
						<span>12%</span>
					</div>
					<div className="flex items-center gap-1 text-[10px]">
						<span className="text-primary">MEM</span>
						<span>4.2GB</span>
					</div>
				</div>
				<div className="text-right">
					<div className="text-xs font-medium text-primary drop-shadow-[0_0_5px_rgba(var(--primary),0.4)]">
						{time
							? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
							: '--:--'}
					</div>
				</div>
			</div>
		</div>
	);
}
