'use client';

import { useAtom } from 'jotai';
import { windowsAtom, activeWindowIdAtom, windowStackAtom } from '@/store/atoms';
import { getModuleIcon } from '@/lib/moduleRegistry';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
	Power,
	Settings,
	Briefcase,
	Map,
	Mail,
	User as UserIcon,
	Github,
	Linkedin,
	Twitter,
	X,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useWindowManager } from '@/hooks/use-window-manager';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpButton } from '@/components/shared/HelpButton';

// A simple logo component
const Logo = () => (
	<div className="w-5 h-5 flex items-center justify-center">
		<div className="w-full h-full border-2 border-emerald-500 rounded-sm rotate-45 flex items-center justify-center">
			<div className="w-2 h-2 bg-emerald-400 rounded-full" />
		</div>
	</div>
);

export function Taskbar() {
	const [windows, setWindows] = useAtom(windowsAtom);
	const [activeWindowId, setActiveWindowId] = useAtom(activeWindowIdAtom);
	const [windowStack, setWindowStack] = useAtom(windowStackAtom);
	const [isStartOpen, setIsStartOpen] = useState(false);
	const { openWindow } = useWindowManager();
	const stateMenuRef = useRef<HTMLDivElement>(null);
	const startButtonRef = useRef<HTMLButtonElement>(null);
	const firstMenuItemRef = useRef<HTMLButtonElement>(null);

	// Close with Escape and restore focus to trigger
	useEffect(() => {
		if (!isStartOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setIsStartOpen(false);
				startButtonRef.current?.focus();
			}
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [isStartOpen]);

	// Focus the first menu item for immediate keyboard access
	useEffect(() => {
		if (!isStartOpen) return;
		firstMenuItemRef.current?.focus();
	}, [isStartOpen]);

	// Close panel when clicking outside
	useEffect(() => {
		if (!isStartOpen) return;
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			const isClickInsideStart =
				stateMenuRef.current && stateMenuRef.current.contains(target);
			const isClickOnButton =
				startButtonRef.current && startButtonRef.current.contains(target);

			if (!isClickInsideStart && !isClickOnButton) {
				setIsStartOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isStartOpen]);

	// Trap Tab inside the menu when open
	const handleMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (!isStartOpen || !stateMenuRef.current) return;
		if (e.key !== 'Tab') return;

		const focusableSelectors = [
			'button',
			'[href]',
			'input',
			'select',
			'textarea',
			'[tabindex]:not([tabindex="-1"])',
		].join(',');
		const focusables = Array.from(
			stateMenuRef.current.querySelectorAll<HTMLElement>(focusableSelectors),
		).filter(el => !el.hasAttribute('disabled') && !el.getAttribute('aria-hidden'));

		if (focusables.length === 0) return;

		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		const active = document.activeElement as HTMLElement | null;
		const isShift = e.shiftKey;

		if (!isShift && active === last) {
			e.preventDefault();
			first.focus();
		} else if (isShift && active === first) {
			e.preventDefault();
			last.focus();
		}
	};

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

	const handleOpenModule = (id: string) => {
		setIsStartOpen(false);
		openWindow(id);
	};

	const handleCloseWindow = (id: string, e: React.MouseEvent) => {
		e.stopPropagation(); // Prevent tab click
		const windowToClose = windows.find(w => w.id === id);
		if (!windowToClose) return;

		// Remove from windows
		setWindows(windows.filter(w => w.id !== id));

		// Update active window if we closed the active one
		if (id === activeWindowId) {
			const remainingStack = windowStack.filter(wid => wid !== id);
			const nextActiveId = remainingStack[remainingStack.length - 1] || null;
			setActiveWindowId(nextActiveId);
			setWindowStack(remainingStack);
		} else {
			setWindowStack(windowStack.filter(wid => wid !== id));
		}
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
			{/* Start Menu Overlay */}
			<AnimatePresence>
				{isStartOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsStartOpen(false)}
							className="fixed inset-0 bg-transparent z-40"
						/>

						{/* Popover */}
						<motion.div
							ref={stateMenuRef}
							initial={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(10px)' }}
							animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
							exit={{ opacity: 0, scale: 0.9, y: 10, filter: 'blur(10px)' }}
							transition={{ type: 'spring', damping: 20, stiffness: 300 }}
							tabIndex={0}
							onKeyDown={handleMenuKeyDown}
							className="absolute bottom-14 left-2 w-[20rem] sm:w-80 z-50 bg-[#0d1117]/80 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] p-4 rounded-2xl overflow-hidden ring-1 ring-white/5"
						>
							<div className="absolute inset-x-0 top-0 h-[100px] bg-linear-to-b from-emerald-500/10 to-transparent pointer-events-none" />

							<div className="relative">
								<div className="flex items-center gap-4 mb-6">
									<div className="relative">
										<div className="absolute inset-0 bg-emerald-500 blur-md opacity-40 rounded-full" />
										<Image
											src="/me.jpg"
											alt="Anurag Basuri"
											width={48}
											height={48}
											className="w-12 h-12 rounded-full border-2 border-white/10 relative z-10"
											priority
										/>
									</div>
									<div>
										<div className="font-bold text-base text-white tracking-wide">
											Anurag Basuri
										</div>
										<div className="text-xs text-white/50 font-mono mt-0.5">
											Full-Stack Engineer
										</div>
									</div>
								</div>

								<div className="grid gap-1 mb-4">
									{menuItems.map((item, index) => (
										<motion.button
											whileHover={{
												x: 4,
												backgroundColor: 'rgba(255,255,255,0.05)',
											}}
											key={item.id}
											ref={index === 0 ? firstMenuItemRef : null}
											onClick={() => handleOpenModule(item.id)}
											className="w-full text-left px-3 py-2.5 rounded-xl text-white/70 transition-colors text-sm flex items-center gap-3 group"
										>
											<div className="p-1.5 rounded-lg bg-white/5 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
												<item.icon className="w-4 h-4" />
											</div>
											<span className="font-medium">{item.label}</span>
										</motion.button>
									))}
								</div>

								<div className="pt-4 border-t border-white/10 flex items-center justify-between">
									<div className="flex items-center gap-2">
										{socialLinks.map(link => (
											<Tooltip key={link.label}>
												<TooltipTrigger asChild>
													<a
														href={link.href}
														target="_blank"
														rel="noopener noreferrer"
														className="h-8 w-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
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
									<div className="flex items-center gap-1">
										<button
											onClick={() => window.location.reload()}
											className="h-8 px-3 flex items-center gap-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors text-xs font-medium uppercase tracking-wider"
										>
											<Power className="w-3.5 h-3.5" />
											<span>Restart</span>
										</button>
									</div>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Main Bar */}
			<motion.div
				initial={{ y: 100, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
				className="h-8 bg-[#0d1117]/60 backdrop-blur-2xl border-t border-white/8 flex items-center justify-between z-40 px-2 sm:px-3 relative"
			>
				{/* Ambient Glow */}
				<div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-emerald-500/20 to-transparent opacity-50" />

				<div className="flex items-center gap-4 h-full">
					{/* Start Button */}
					<Tooltip>
						<TooltipTrigger asChild>
							<motion.button
								ref={startButtonRef}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => setIsStartOpen(!isStartOpen)}
								className={cn(
									'h-6 px-3 rounded-md flex items-center gap-2 transition-all duration-300',
									isStartOpen
										? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
										: 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/5 hover:border-white/10',
								)}
							>
								<Logo />
								<span className="text-[11px] font-bold tracking-wider uppercase">
									Start
								</span>
							</motion.button>
						</TooltipTrigger>
						<TooltipContent side="top">
							System Menu
						</TooltipContent>
					</Tooltip>

					{/* Divider */}
					{windows.length > 0 && <div className="h-4 w-px bg-white/10" />}

					{/* Window Icons (Dock Style) */}
					<div className="flex items-center gap-2 h-full">
						<AnimatePresence mode="popLayout">
							{windows.map(window => {
								const Icon = getModuleIcon(window.id);
								const isActive =
									window.id === activeWindowId && !window.isMinimized;

								return (
									<Tooltip key={window.id}>
										<TooltipTrigger asChild>
											<motion.button
												layout
												initial={{ opacity: 0, scale: 0.5, y: 10 }}
												animate={{ opacity: 1, scale: 1, y: 0 }}
												exit={{ opacity: 0, scale: 0.5, y: 10 }}
												whileHover={{ scale: 1.05, y: -2 }}
												whileTap={{ scale: 0.95 }}
												onClick={() => handleTaskbarClick(window.id)}
												className={cn(
													'relative h-7 px-3 rounded-md flex items-center gap-2 transition-all duration-300 group border',
													isActive
														? 'bg-white/[0.08] border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
														: 'bg-transparent border-transparent hover:bg-white/[0.04] hover:border-white/5',
												)}
											>
												<Icon
													className={cn(
														'w-3.5 h-3.5 transition-colors',
														isActive
															? 'text-emerald-400'
															: 'text-white/60 group-hover:text-white/80',
													)}
												/>

												<span
													className={cn(
														'text-[10px] font-medium transition-colors max-w-[100px] truncate',
														isActive
															? 'text-white/90'
															: 'text-white/50 group-hover:text-white/70',
													)}
												>
													{window.title}
												</span>

												{/* Active Indicator & Close Button */}
												{isActive && (
													<motion.div
														layoutId="active-pill"
														className="absolute -bottom-[1px] left-2 right-2 h-[2px] bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"
													/>
												)}

												<div
													role="button"
													onClick={e => handleCloseWindow(window.id, e)}
													className="ml-1 opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-white/10 text-white/40 hover:text-red-400 transition-all"
												>
													<X className="w-3 h-3" />
												</div>
											</motion.button>
										</TooltipTrigger>
										<TooltipContent side="top">
											{window.title}
										</TooltipContent>
									</Tooltip>
								);
							})}
						</AnimatePresence>
					</div>
				</div>

				{/* Right Side Actions */}
				<div className="flex items-center gap-2">
					<HelpButton placement="taskbar" />
				</div>
			</motion.div>
		</TooltipProvider>
	);
}
