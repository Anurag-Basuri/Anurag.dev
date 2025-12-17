'use client';

import { getModuleIcon, getModuleTitle } from '@/lib/moduleRegistry';
import { taskbarModules, navigationItems, getModulePath, type ModuleId } from '@/lib/routes';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Power, Github, Linkedin, Twitter } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpButton } from '@/components/common/HelpButton';
import React, { memo } from 'react';

// A simple logo component
const Logo = () => (
	<div className="w-5 h-5 flex items-center justify-center">
		<div className="w-full h-full border-2 border-emerald-500 rounded-sm rotate-45 flex items-center justify-center">
			<div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
		</div>
	</div>
);

// Taskbar navigation item based on routes
const TaskbarNavItem = memo(function TaskbarNavItem({
	moduleId,
	isActive,
	onClick,
}: {
	moduleId: string;
	isActive: boolean;
	onClick: () => void;
}) {
	const Icon = getModuleIcon(moduleId);
	const title = getModuleTitle(moduleId);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={onClick}
					className={cn(
						'relative h-7 sm:h-6 px-2.5 rounded-md flex items-center gap-2 transition-all duration-200 group border cursor-pointer backdrop-blur-sm',
						isActive
							? 'bg-white/10 border-white/10 shadow-sm'
							: 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/10',
					)}
				>
					<Icon
						className={cn(
							'w-3.5 h-3.5 transition-colors duration-300',
							isActive
								? 'text-emerald-300'
								: 'text-white/75 group-hover:text-emerald-300',
						)}
					/>

					<span
						className={cn(
							'text-[11px] font-semibold transition-colors max-w-[120px] truncate tracking-wide hidden sm:block',
							isActive ? 'text-white' : 'text-white/75 group-hover:text-white',
						)}
					>
						{title}
					</span>

					{/* Active Indicator */}
					{isActive && (
						<motion.div
							layoutId="active-pill"
							initial={{ opacity: 0, scale: 0.5 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.5 }}
							transition={{ type: 'spring', stiffness: 500, damping: 30 }}
							className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-emerald-300 rounded-full shadow-[0_0_10px_2px_rgba(52,211,153,0.6)]"
						/>
					)}
				</motion.button>
			</TooltipTrigger>
			<TooltipContent side="top" className="text-xs font-medium">
				{title}
			</TooltipContent>
		</Tooltip>
	);
});

export function Taskbar() {
	const router = useRouter();
	const pathname = usePathname();
	const [isStartOpen, setIsStartOpen] = useState(false);
	const stateMenuRef = useRef<HTMLDivElement>(null);
	const startButtonRef = useRef<HTMLButtonElement>(null);
	const firstMenuItemRef = useRef<HTMLButtonElement>(null);

	// Get current module from pathname
	const currentModule = useMemo(() => {
		const path = pathname.replace('/app/', '').replace(/^\/+/, '');
		return path || 'about';
	}, [pathname]);

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

	const handleMenuKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
		if (!stateMenuRef.current) return;
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
	}, []);

	const handleNavigate = useCallback(
		(moduleId: ModuleId) => {
			setIsStartOpen(false);
			router.push(getModulePath(moduleId));
		},
		[router],
	);

	// Menu items from centralized config with icons
	const menuItemsWithIcons = navigationItems.map(item => ({
		...item,
		icon: getModuleIcon(item.id),
	}));

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
		<TooltipProvider delayDuration={500} skipDelayDuration={200}>
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
							className="absolute bottom-14 sm:bottom-12 left-2 right-2 sm:right-auto w-auto sm:w-80 z-50 bg-black/60 backdrop-blur-3xl border border-white/10 shadow-[0_10px_50px_-10px_rgba(0,0,0,0.5)] p-4 rounded-2xl overflow-hidden ring-1 ring-white/5"
						>
							<div className="absolute inset-x-0 top-0 h-[120px] bg-gradient-to-b from-emerald-500/10 via-emerald-500/5 to-transparent pointer-events-none" />

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
									{menuItemsWithIcons.map((item, index) => {
										const IconComponent = item.icon;
										return (
											<motion.button
												layout
												whileHover={{
													x: 6,
													backgroundColor: 'rgba(255,255,255,0.06)',
												}}
												whileTap={{ scale: 0.98 }}
												key={item.id}
												ref={index === 0 ? firstMenuItemRef : null}
												onClick={() => handleNavigate(item.id)}
												className="w-full text-left px-3 py-2.5 rounded-xl text-white/70 transition-colors text-sm flex items-center gap-3 group relative overflow-hidden"
											>
												<div className="p-2 rounded-lg bg-white/5 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors shadow-sm">
													<IconComponent className="w-4 h-4" />
												</div>
												<div className="flex flex-col">
													<span className="font-medium tracking-wide">
														{item.label}
													</span>
													<span className="text-xs text-white/40">
														{item.description}
													</span>
												</div>

												{/* Hover sheen */}
												<motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shimmer" />
											</motion.button>
										);
									})}
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
													onClick={() => {
														router.push('/');
													}}
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
				initial={{ y: 90, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
				className="w-full shrink-0 h-8 bg-[#050505]/80 backdrop-blur-xl backdrop-saturate-150 border-t border-white/5 flex items-center justify-between z-40 px-3 sm:px-4 shadow-sm relative overflow-hidden"
			>
				<div className="absolute inset-0 pointer-events-none">
					<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/25 to-transparent" />
					<div className="absolute inset-y-0 left-0 w-px bg-white/5" />
					<div className="absolute inset-y-0 right-0 w-px bg-white/5" />
				</div>

				<div className="flex items-center gap-2.5 sm:gap-3.5 h-full w-full sm:w-auto overflow-x-auto scrollbar-hide px-1.5">
					{/* Start Button */}
					<Tooltip>
						<TooltipTrigger asChild>
							<motion.button
								ref={startButtonRef}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								onClick={() => setIsStartOpen(!isStartOpen)}
								className={cn(
									'h-7 sm:h-6 px-3 rounded-md flex items-center gap-2 transition-all duration-300 relative group shrink-0 border',
									isStartOpen
										? 'bg-emerald-500/20 border-emerald-400/40 text-white shadow-[0_0_15px_rgba(52,211,153,0.3)]'
										: 'bg-white/5 border-white/5 text-white/80 hover:bg-white/10 hover:border-white/10',
								)}
							>
								<Logo />
								<span className="text-[10px] font-extrabold tracking-[0.22em] uppercase hidden sm:block">
									Start
								</span>
								{/* Bottom glow on hover */}
								{!isStartOpen && (
									<div className="absolute -bottom-1 left-2 right-2 h-1 bg-emerald-400/50 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
								)}
							</motion.button>
						</TooltipTrigger>
						<TooltipContent side="top">System Menu</TooltipContent>
					</Tooltip>

					{/* Divider */}
					<div className="h-4 w-px bg-white/10 shrink-0" />

					<div className="flex items-center gap-2 h-full">
						<AnimatePresence>
							{taskbarModules.map(moduleId => (
								<TaskbarNavItem
									key={moduleId}
									moduleId={moduleId}
									isActive={currentModule === moduleId}
									onClick={() => handleNavigate(moduleId)}
								/>
							))}
						</AnimatePresence>
					</div>
				</div>

				{/* Right Side Actions */}
				<div className="hidden sm:flex items-center gap-2">
					<div className="h-6 px-3 rounded-md bg-white/7 border border-white/14 shadow-inner flex items-center">
						<HelpButton placement="taskbar" />
					</div>
				</div>
			</motion.div>
		</TooltipProvider>
	);
}
