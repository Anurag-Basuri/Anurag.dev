'use client';

import { useAtom } from 'jotai';
import { windowsAtom, activeWindowIdAtom, windowStackAtom } from '@/store/atoms';
import { getModuleIcon } from '@/lib/moduleRegistry';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
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
import { WindowState } from '@/types/window';
import React, { memo } from 'react';

// A simple logo component
const Logo = () => (
	<div className="w-5 h-5 flex items-center justify-center">
		<div className="w-full h-full border-2 border-emerald-500 rounded-sm rotate-45 flex items-center justify-center">
			<div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
		</div>
	</div>
);

const TaskbarItem = memo(function TaskbarItem({
	window,
	isActive,
	onClick,
	onClose,
}: {
	window: WindowState;
	isActive: boolean;
	onClick: () => void;
	onClose: (e: React.MouseEvent) => void;
}) {
	const isLoading = window.isLoading || false;
	const Icon = getModuleIcon(window.id);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<motion.div
					layout
					initial={{ opacity: 0, scale: 0.9, y: 5 }}
					animate={{
						opacity: 1,
						scale: 1,
						y: 0,
					}}
					exit={{
						opacity: 0,
						scale: 0.9,
						y: 5,
					}}
					transition={{
						type: 'spring',
						stiffness: 400,
						damping: 30,
					}}
					onClick={onClick}
					className={cn(
						'relative h-10 sm:h-9 md:h-7 px-3 min-h-[44px] sm:min-h-0 rounded-lg flex items-center gap-2 transition-colors duration-200 group border cursor-pointer',
						isActive
							? 'bg-white/8 border-white/10 shadow-[0_4px_12px_rgba(0,0,0,0.2)]'
							: 'bg-transparent border-transparent hover:bg-white/5',
					)}
				>
					<Icon
						className={cn(
							'w-3.5 h-3.5 transition-colors duration-300',
							isActive
								? 'text-emerald-400'
								: 'text-white/60 group-hover:text-emerald-400',
						)}
					/>

					<span
						className={cn(
							'text-[10px] font-medium transition-colors max-w-[100px] truncate',
							isActive ? 'text-white/90' : 'text-white/50 group-hover:text-white',
						)}
					>
						{window.title}
					</span>

					{/* Active Indicator (Glowing Pill Underneath) */}
					{isActive && (
						<motion.div
							layoutId="active-pill"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="absolute -bottom-[2px] left-3 right-3 h-[2px] bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]"
						/>
					)}

					{/* Close Button on Hover */}
					{/* Close Button */}
					<button
						onClick={onClose}
						className="ml-1 p-1 sm:p-0.5 rounded-full bg-red-500/10 hover:bg-red-500/30 text-red-400 transition-all opacity-100 sm:opacity-0 sm:group-hover:opacity-100 shrink-0"
						aria-label="Close window"
						type="button"
					>
						<X className="w-3 h-3 sm:w-2.5 sm:h-2.5" />
					</button>
				</motion.div>
			</TooltipTrigger>
			<TooltipContent side="top" className="text-xs font-medium">
				{window.title}
			</TooltipContent>
		</Tooltip>
	);
});

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
		setWindows(prev => {
			const window = prev.find(w => w.id === id);
			if (!window) return prev;

			if (id === activeWindowId && !window.isMinimized) {
				// If clicking the active window, minimize it
				setWindowStack(stack => stack.filter(wid => wid !== id));
				setWindowStack(stack => {
					const nextActiveId = stack.at(-1) || null;
					setActiveWindowId(nextActiveId);
					return stack;
				});
				return prev.map(w => (w.id === id ? { ...w, isMinimized: true } : w));
			} else {
				// Show loading briefly, then open window
				const updated = prev.map(w => ({
					...w,
					isMinimized: w.id !== id,
					isLoading: w.id === id ? true : false,
				}));

				// Clear loading after transition
				setTimeout(() => {
					setWindows(current => current.map(w => ({ ...w, isLoading: false })));
				}, 250);

				setActiveWindowId(id);
				setWindowStack(stack => [...stack.filter(wid => wid !== id), id]);
				return updated;
			}
		});
	};

	const handleOpenModule = (id: string) => {
		setIsStartOpen(false);
		openWindow(id);
	};

	const handleReorder = (newOrder: WindowState[]) => {
		setWindows(newOrder);
		setWindowStack(newOrder.map(w => w.id));
	};

	const handleCloseWindow = (id: string, e: React.MouseEvent) => {
		e.stopPropagation();

		setWindows(prev => {
			const windowToClose = prev.find(w => w.id === id);
			if (!windowToClose) return prev;

			setWindowStack(stack => {
				const remainingStack = stack.filter(wid => wid !== id);
				const nextActiveId = remainingStack.at(-1) || null;

				// Smooth close sequence
				if (id === activeWindowId && nextActiveId) {
					// First: Mark next window as loading
					setWindows(current =>
						current.map(w => (w.id === nextActiveId ? { ...w, isLoading: true } : w)),
					);

					// Second: After brief delay, remove current and show next
					setTimeout(() => {
						setWindows(current =>
							current
								.map(w =>
									w.id === nextActiveId
										? { ...w, isMinimized: false, isLoading: false }
										: w,
								)
								.filter(w => w.id !== id),
						);
					}, 200);
				}

				setActiveWindowId(nextActiveId);
				return remainingStack;
			});

			// Return filtered windows immediately if not active, or wait for setTimeout if active
			return id !== activeWindowId ? prev.filter(w => w.id !== id) : prev;
		});
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
							initial={{ opacity: 0, scale: 0.9, y: 15, filter: 'blur(10px)' }}
							animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
							exit={{ opacity: 0, scale: 0.9, y: 15, filter: 'blur(10px)' }}
							transition={{ type: 'spring', damping: 25, stiffness: 350 }}
							tabIndex={0}
							onKeyDown={handleMenuKeyDown}
							className="absolute bottom-16 sm:bottom-14 left-2 right-2 sm:right-auto w-auto sm:w-80 z-50 bg-black/60 backdrop-blur-3xl border border-white/10 shadow-[0_10px_50px_-10px_rgba(0,0,0,0.5)] p-4 rounded-2xl overflow-hidden ring-1 ring-white/5"
						>
							<div className="absolute inset-x-0 top-0 h-[120px] bg-linear-to-b from-emerald-500/10 via-emerald-500/5 to-transparent pointer-events-none" />

							<div className="relative z-10">
								<div className="flex items-center gap-4 mb-6">
									<div className="relative group">
										<div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
										<Image
											src="/me.jpg"
											alt="Anurag Basuri"
											width={52}
											height={52}
											className="w-13 h-13 rounded-full border-2 border-white/10 relative z-10 shadow-lg group-hover:scale-105 transition-transform duration-300"
											priority
										/>
									</div>
									<div>
										<div className="font-bold text-lg text-white tracking-wide">
											Anurag Basuri
										</div>
										<div className="text-xs text-white/50 font-mono mt-0.5 flex items-center gap-1.5">
											<span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
											Full-Stack Engineer
										</div>
									</div>
								</div>

								<div className="grid gap-1.5 mb-5">
									{menuItems.map((item, index) => (
										<motion.button
											layout
											whileHover={{
												x: 6,
												backgroundColor: 'rgba(255,255,255,0.06)',
											}}
											whileTap={{ scale: 0.98 }}
											key={item.id}
											ref={index === 0 ? firstMenuItemRef : null}
											onClick={() => handleOpenModule(item.id)}
											className="w-full text-left px-3 py-2.5 rounded-xl text-white/70 transition-colors text-sm flex items-center gap-3 group relative overflow-hidden"
										>
											<div className="p-2 rounded-lg bg-white/5 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors shadow-sm">
												<item.icon className="w-4 h-4" />
											</div>
											<span className="font-medium tracking-wide">
												{item.label}
											</span>

											{/* Hover sheen */}
											<motion.div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
										</motion.button>
									))}
								</div>

								<div className="pt-4 border-t border-white/10 flex items-center justify-between">
									<div className="flex items-center gap-2">
										{socialLinks.map(link => (
											<Tooltip key={link.label}>
												<TooltipTrigger asChild>
													<motion.a
														whileHover={{ y: -2, scale: 1.1 }}
														whileTap={{ scale: 0.9 }}
														href={link.href}
														target="_blank"
														rel="noopener noreferrer"
														className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-emerald-500/20 hover:border-emerald-500/30 border border-transparent transition-all duration-200"
													>
														<link.icon className="w-4 h-4" />
													</motion.a>
												</TooltipTrigger>
												<TooltipContent side="top">
													<p>{link.label}</p>
												</TooltipContent>
											</Tooltip>
										))}
									</div>
									<div className="flex items-center gap-1">
										<Tooltip>
											<TooltipTrigger asChild>
												<motion.button
													whileHover={{ scale: 1.05 }}
													whileTap={{ scale: 0.95 }}
													onClick={() => window.location.reload()}
													className="h-9 px-4 flex items-center gap-2 rounded-xl text-white/40 hover:text-white hover:bg-red-500/20 transition-all text-xs font-bold uppercase tracking-wider group"
												>
													<Power className="w-3.5 h-3.5 group-hover:text-red-400 transition-colors" />
													<span>Restart</span>
												</motion.button>
											</TooltipTrigger>
											<TooltipContent side="top">
												Restart Session
											</TooltipContent>
										</Tooltip>
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
				className="w-full shrink-0 h-14 sm:h-10 md:h-8 bg-black/40 backdrop-blur-2xl border-t border-white/10 flex items-center justify-between z-40 px-2 sm:px-3 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.3)]"
			>
				{/* Ambient Glow */}
				<div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-emerald-500/30 to-transparent opacity-60" />

				<div className="flex items-center gap-2 sm:gap-4 h-full w-full sm:w-auto overflow-x-auto scrollbar-hide px-2">
					{/* Start Button */}
					<Tooltip>
						<TooltipTrigger asChild>
							<motion.button
								ref={startButtonRef}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => setIsStartOpen(!isStartOpen)}
								className={cn(
									'h-8 sm:h-6 px-3 rounded-lg flex items-center gap-2 transition-all duration-300 relative group shrink-0',
									isStartOpen
										? 'bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.5)]'
										: 'bg-white/5 hover:bg-white/10 text-white/80 hover:text-white border border-white/5 hover:border-white/10',
								)}
							>
								<Logo />
								<span className="text-[10px] font-bold tracking-widest uppercase hidden sm:block">
									Start
								</span>

								{/* Bottom glow on hover */}
								{!isStartOpen && (
									<div className="absolute -bottom-1 left-2 right-2 h-1 bg-emerald-500/50 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
								)}
							</motion.button>
						</TooltipTrigger>
						<TooltipContent side="top">System Menu</TooltipContent>
					</Tooltip>

					{/* Divider */}
					{windows.length > 0 && <div className="h-4 w-px bg-white/10 shrink-0" />}

					{/* Window Icons (Mac Dock Style) */}
					<Reorder.Group
						axis="x"
						values={windows}
						onReorder={handleReorder}
						className="flex items-center gap-1.5 h-full pl-1"
						as="div"
					>
						{windows.map(window => (
							<Reorder.Item
								key={window.id}
								value={window}
								as="div"
								initial={false}
								className="flex shrink-0"
							>
								<TaskbarItem
									window={window}
									isActive={window.id === activeWindowId && !window.isMinimized}
									onClick={() => handleTaskbarClick(window.id)}
									onClose={e => handleCloseWindow(window.id, e)}
								/>
							</Reorder.Item>
						))}
					</Reorder.Group>
				</div>

				{/* Right Side Actions - Hidden on mobile to save space, redundant with TopBar */}
				<div className="hidden sm:flex items-center gap-2">
					<HelpButton placement="taskbar" />
				</div>
			</motion.div>
		</TooltipProvider>
	);
}
