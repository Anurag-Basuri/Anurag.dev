'use client';

import { useAtom } from 'jotai';
import { windowsAtom, activeWindowIdAtom, windowStackAtom } from '@/store/atoms';
import { getModuleIcon } from '@/lib/moduleRegistry';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import {
	Power,
	Settings,
	Cpu,
	Briefcase,
	Map,
	Mail,
	User as UserIcon,
	Github,
	Linkedin,
	Twitter,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useWindowManager } from '@/hooks/use-window-manager';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

function useSystemStats() {
	const [stats, setStats] = useState({ cpu: 12, mem: 4.2, disk: 78 });
	useEffect(() => {
		const intervals = [
			setInterval(() => {
				setStats(s => ({ ...s, cpu: Math.floor(Math.random() * (25 - 5) + 5) }));
			}, 2000),
			setInterval(() => {
				setStats(s => ({ ...s, mem: Number((4 + Math.random() * 2).toFixed(1)) }));
			}, 5000),
		];
		return () => intervals.forEach(clearInterval);
	}, []);
	return stats;
}

// A simple logo component
const Logo = () => (
	<div className="w-5 h-5 flex items-center justify-center">
		<div className="w-full h-full border-2 border-current rounded-full flex items-center justify-center">
			<div className="w-1/2 h-1/2 bg-current rounded-full" />
		</div>
	</div>
);

export function Taskbar() {
	const [windows, setWindows] = useAtom(windowsAtom);
	const [activeWindowId, setActiveWindowId] = useAtom(activeWindowIdAtom);
	const [windowStack, setWindowStack] = useAtom(windowStackAtom);
	const [time, setTime] = useState<Date | null>(null);
	const [isStartOpen, setIsStartOpen] = useState(false);
	const stats = useSystemStats();
	const { openWindow } = useWindowManager();
	const startMenuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const timer = setInterval(() => setTime(new Date()), 1000);
		const handleClickOutside = (event: MouseEvent) => {
			if (startMenuRef.current && !startMenuRef.current.contains(event.target as Node)) {
				setIsStartOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			clearInterval(timer);
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const handleTaskbarClick = (id: string) => {
		const window = windows.find(w => w.id === id);
		if (!window) return;

		if (id === activeWindowId && !window.isMinimized) {
			setWindows(windows.map(w => (w.id === id ? { ...w, isMinimized: true } : w)));
			const nextActiveId = windowStack.filter(wid => wid !== id).pop();
			setActiveWindowId(nextActiveId || null);
		} else {
			setWindows(windows.map(w => (w.id === id ? { ...w, isMinimized: false } : w)));
			setActiveWindowId(id);
			setWindowStack([...windowStack.filter(wid => wid !== id), id]);
		}
	};

	const handleOpenModule = (id: string, title: string) => {
		setIsStartOpen(false);
		openWindow(id, title);
	};

	const menuItems = [
		{ id: 'about', label: 'About Me', icon: UserIcon },
		{ id: 'projects', label: 'My Work', icon: Briefcase },
		{ id: 'journey', label: 'My Journey', icon: Map },
		{ id: 'contact', label: 'Get in Touch', icon: Mail },
	];

	const socialLinks = [
		{
			href: 'https://github.com/Anurag-Basuri',
			icon: Github,
			label: 'GitHub',
		},
		{
			href: 'https://www.linkedin.com/in/anurag-basuri-941546214/',
			icon: Linkedin,
			label: 'LinkedIn',
		},
		{
			href: 'https://twitter.com/AnuragBasuri',
			icon: Twitter,
			label: 'Twitter',
		},
	];

	return (
		<TooltipProvider delayDuration={0}>
			<div className="h-12 bg-background/30 backdrop-blur-xl border-t border-border/60 flex items-center justify-between z-40 shadow-[0_-2px_10px_rgba(0,0,0,0.1)] px-2">
				{/* Left side: Start and Window Icons */}
				<div className="flex items-center gap-2">
					{/* Start Button */}
					<div className="relative" ref={startMenuRef}>
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									onClick={() => setIsStartOpen(!isStartOpen)}
									className={cn(
										'h-9 w-9 flex items-center justify-center rounded-md transition-all duration-200',
										'hover:bg-primary/10 hover:text-primary',
										isStartOpen && 'bg-primary/15 text-primary',
									)}
								>
									<Logo />
								</button>
							</TooltipTrigger>
							<TooltipContent side="top" align="center">
								<p>Start</p>
							</TooltipContent>
						</Tooltip>

						{/* Start Menu */}
						<AnimatePresence>
							{isStartOpen && (
								<motion.div
									initial={{ opacity: 0, y: 10, scale: 0.95 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: 10, scale: 0.95 }}
									transition={{ duration: 0.15, ease: 'easeOut' }}
									className="absolute bottom-12 left-0 w-80 glass-premium border border-border/50 shadow-[0_0_40px_rgba(0,0,0,0.4)] p-2 rounded-lg overflow-hidden"
								>
									<div className="flex items-center gap-4 p-3 border-b border-border/50 mb-2">
										<img
											src="/me.jpg"
											alt="Anurag Basuri"
											className="w-12 h-12 rounded-full border-2 border-primary/50 shadow-[0_0_10px_rgba(var(--primary-rgb),0.4)]"
										/>
										<div>
											<div className="font-bold text-primary drop-shadow-[0_0_5px_rgba(var(--primary-rgb),0.3)]">
												Anurag Basuri
											</div>
											<div className="text-xs text-muted-foreground">
												Full-Stack Developer
											</div>
										</div>
									</div>

									<div className="grid grid-cols-2 gap-1">
										{menuItems.map(item => (
											<button
												key={item.id}
												onClick={() =>
													handleOpenModule(item.id, item.label)
												}
												className="w-full text-left px-3 py-2.5 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all duration-200 text-sm flex items-center gap-3 group rounded-md"
											>
												<item.icon className="w-4 h-4 opacity-80 group-hover:opacity-100 transition-opacity" />
												{item.label}
											</button>
										))}
									</div>

									<div className="mt-2 pt-2 border-t border-border/50 flex items-center justify-between">
										<div className="flex items-center gap-1">
											{socialLinks.map(link => (
												<Tooltip key={link.label}>
													<TooltipTrigger asChild>
														<a
															href={link.href}
															target="_blank"
															rel="noopener noreferrer"
															className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
														>
															<link.icon className="w-4 h-4" />
														</a>
													</TooltipTrigger>
													<TooltipContent side="top">
														<p>{link.label}</p>
													</TooltipContent>
												</Tooltip>
											))}
										</div>
										<div className="flex items-center">
											<Tooltip>
												<TooltipTrigger asChild>
													<button
														onClick={() =>
															toast('Settings coming soon!', {
																icon: '⚙️',
															})
														}
														className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
													>
														<Settings className="w-4 h-4" />
													</button>
												</TooltipTrigger>
												<TooltipContent side="top">
													<p>Settings</p>
												</TooltipContent>
											</Tooltip>
											<Tooltip>
												<TooltipTrigger asChild>
													<button
														onClick={() => window.location.reload()}
														className="h-8 w-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
													>
														<Power className="w-4 h-4" />
													</button>
												</TooltipTrigger>
												<TooltipContent side="top">
													<p>Restart Session</p>
												</TooltipContent>
											</Tooltip>
										</div>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>

					{/* Window Icons */}
					<div className="flex items-center gap-2">
						{windows.map(window => {
							const Icon = getModuleIcon(window.id);
							const isActive = window.id === activeWindowId && !window.isMinimized;
							return (
								<Tooltip key={window.id}>
									<TooltipTrigger asChild>
										<motion.button
											layout
											onClick={() => handleTaskbarClick(window.id)}
											className={cn(
												'h-9 w-9 flex items-center justify-center rounded-md transition-colors duration-200 relative',
												'hover:bg-primary/10',
												isActive ? 'bg-primary/20' : 'bg-transparent',
											)}
										>
											<Icon className="h-5 w-5" />
											<motion.div
												className={cn(
													'absolute -bottom-1 h-0.5 w-4 rounded-full',
													isActive ? 'bg-primary' : 'bg-transparent',
												)}
											/>
										</motion.button>
									</TooltipTrigger>
									<TooltipContent side="top">
										<p>{window.title}</p>
									</TooltipContent>
								</Tooltip>
							);
						})}
					</div>
				</div>

				{/* Right side: System Tray */}
				<div className="flex items-center gap-3 px-2 text-muted-foreground text-xs">
					<Tooltip>
						<TooltipTrigger className="hidden sm:flex items-center gap-1.5">
							<Cpu className="w-3.5 h-3.5 text-primary/80" />
							<span>{stats.cpu}%</span>
						</TooltipTrigger>
						<TooltipContent side="top">
							<p>CPU Usage</p>
						</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger className="hidden lg:flex items-center gap-1.5">
							<div className="w-2.5 h-3.5 border-2 border-primary/80 rounded-sm flex items-end">
								<div
									className="w-full bg-primary/80"
									style={{ height: `${(stats.mem / 16) * 100}%` }}
								/>
							</div>
							<span>{stats.mem}GB</span>
						</TooltipTrigger>
						<TooltipContent side="top">
							<p>Memory Usage</p>
						</TooltipContent>
					</Tooltip>
					<Tooltip>
						<TooltipTrigger className="text-right">
							<div className="font-medium text-foreground">
								{time
									? time.toLocaleTimeString([], {
											hour: '2-digit',
											minute: '2-digit',
									  })
									: '--:--'}
							</div>
							<div className="text-[10px] -mt-0.5">
								{time ? time.toLocaleDateString() : ''}
							</div>
						</TooltipTrigger>
						<TooltipContent side="top">
							<p>It&apos;s currently {time?.toLocaleString()}</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</div>
		</TooltipProvider>
	);
}
