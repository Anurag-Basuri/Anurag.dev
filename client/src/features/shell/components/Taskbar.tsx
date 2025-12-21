'use client';

import { getModuleIcon, getModuleTitle } from '@/lib/moduleRegistry';
import { taskbarModules, navigationItems, getModulePath, type ModuleId } from '@/lib/routes';
import { cn } from '@/lib/utils';
import React, { memo, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Power, Github, Linkedin, Twitter, X, type LucideIcon, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpButton } from '@/components/common/HelpButton';
import { useAtom } from 'jotai';
import { openFilesAtom, type OpenFile } from '@/store';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

// A simple logo component
const Logo = () => (
	<div className="w-5 h-5 flex items-center justify-center">
		<div className="w-full h-full border-2 border-emerald-500 rounded-sm rotate-45 flex items-center justify-center bg-emerald-500/10 backdrop-blur-sm">
			<div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
		</div>
	</div>
);

const VALID_MODULE_IDS = new Set<ModuleId>([
	...taskbarModules,
	...navigationItems.map(item => item.id),
]);

const normalizeModuleId = (id: string): ModuleId => {
	return VALID_MODULE_IDS.has(id as ModuleId) ? (id as ModuleId) : 'about';
};

type ModuleIconComponent = LucideIcon;

const MODULE_ICON_BY_ID: Record<ModuleId, ModuleIconComponent> = (() => {
	const icons = {} as Record<ModuleId, ModuleIconComponent>;

	for (const id of VALID_MODULE_IDS) {
		icons[id] = getModuleIcon(id);
	}

	return icons;
})();

const MENU_ITEMS_WITH_ICONS = navigationItems.map(item => ({
	...item,
	icon: MODULE_ICON_BY_ID[item.id],
}));

// Taskbar navigation item based on routes
const TaskbarNavItem = memo(function TaskbarNavItem({
	moduleId,
	isActive,
	onClick,
	onClose,
}: {
	moduleId: string;
	isActive: boolean;
	onClick: () => void;
	onClose?: (moduleId: string) => void;
}) {
	const safeModuleId = normalizeModuleId(moduleId);
	const IconComponent = MODULE_ICON_BY_ID[safeModuleId];
	const title = getModuleTitle(safeModuleId);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<motion.button
					layout
					initial={{ opacity: 0, scale: 0.8, y: 10 }}
					animate={{ opacity: 1, scale: 1, y: 0 }}
					exit={{ opacity: 0, scale: 0.8, y: 10, transition: { duration: 0.15 } }}
					whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
					whileTap={{ scale: 0.95 }}
					onClick={onClick}
					className={cn(
						'relative h-9 sm:h-8 px-3 sm:px-3.5 rounded-lg flex items-center gap-2.5 transition-all duration-300 group cursor-pointer overflow-hidden backdrop-blur-md',
						isActive
							? 'bg-white/10 border border-white/10 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.3)] shadow-emerald-500/10'
							: 'bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 hover:shadow-lg',
					)}
				>
					{/* Active Gradient Background */}
					{isActive && (
						<div className="absolute inset-0 bg-linear-to-b from-white/5 to-transparent pointer-events-none" />
					)}

					{/* Bottom Active Glow */}
					{isActive && (
						<motion.div
							layoutId="active-nav-glow"
							className="absolute inset-x-0 bottom-0 h-[2px] bg-linear-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_10px_rgba(52,211,153,0.7)]"
						/>
					)}

					<IconComponent
						className={cn(
							'w-4 h-4 transition-colors duration-300',
							isActive
								? 'text-emerald-300 drop-shadow-[0_0_3px_rgba(52,211,153,0.5)]'
								: 'text-white/60 group-hover:text-emerald-300',
						)}
					/>

					<span
						className={cn(
							'text-[12px] font-medium transition-colors duration-300 max-w-[120px] truncate tracking-wide hidden sm:block',
							isActive ? 'text-white' : 'text-white/60 group-hover:text-white',
						)}
					>
						{title}
					</span>

					{/* Close Button - Appears on hover */}
					{onClose && (
						<div
							onClick={e => {
								e.stopPropagation();
								onClose(safeModuleId);
							}}
							className="absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/10 hover:bg-red-500/20 text-white/40 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 cursor-pointer"
							role="button"
							aria-label={`Close ${title}`}
							tabIndex={0}
							onKeyDown={e => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									e.stopPropagation();
									onClose(safeModuleId);
								}
							}}
						>
							<X className="w-2.5 h-2.5" />
						</div>
					)}
				</motion.button>
			</TooltipTrigger>
			<TooltipContent
				side="top"
				className="text-xs font-medium bg-black/80 backdrop-blur-xl border border-white/10"
			>
				{title}
			</TooltipContent>
		</Tooltip>
	);
});

export const Taskbar = memo(function Taskbar({
	openFiles = [],
	isMobile = false,
}: {
	openFiles?: OpenFile[];
	isMobile?: boolean;
}) {
	const router = useRouter();
	const pathname = usePathname();
	const [, setOpenFilesState] = useAtom(openFilesAtom);
	const [isStartOpen, setIsStartOpen] = useState(false);
	const stateMenuRef = useRef<HTMLDivElement>(null);
	const startButtonRef = useRef<HTMLButtonElement>(null);
	const firstMenuItemRef = useRef<HTMLButtonElement>(null);

	// Get current module from pathname
	const currentModule = useMemo(() => {
		const path = pathname.replace('/portfolio/', '').replace(/^\/+/, '');
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
		(moduleId: string) => {
			const safeModuleId = normalizeModuleId(moduleId);
			setIsStartOpen(false);
			router.push(getModulePath(safeModuleId));
		},
		[router],
	);

	/**
	 * Determine which file to navigate to after closing the current one.
	 * Prefers the most recently used file, falls back to empty string (root).
	 */
	const getNavigationTarget = useCallback(
		(closingModuleId: string): string => {
			const remainingFiles = openFiles.filter(f => f.moduleId !== closingModuleId);

			// If files remain, go to most recent (last in array)
			if (remainingFiles.length > 0) {
				return remainingFiles[remainingFiles.length - 1].moduleId;
			}

			// No files left - return empty string to go to root
			return '';
		},
		[openFiles],
	);

	const handleCloseItem = useCallback(
		(moduleId: string) => {
			// Get navigation target BEFORE removing file
			const targetModule = getNavigationTarget(moduleId);

			// Remove from open files
			setOpenFilesState(prev => prev.filter(f => f.moduleId !== moduleId));

			// Always navigate when closing a tab
			// If target exists, go to that module, otherwise go to empty state
			if (targetModule) {
				router.push(`/portfolio/${targetModule}`);
			} else {
				router.push('/portfolio');
			}
		},
		[getNavigationTarget, router, setOpenFilesState],
	);

	// Menu items from centralized config with icons
	const menuItemsWithIcons = MENU_ITEMS_WITH_ICONS;

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
							tabIndex={0}
							onKeyDown={handleMenuKeyDown}
							initial={{ opacity: 0, y: 20, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 20, scale: 0.95 }}
							transition={{ type: 'spring', stiffness: 300, damping: 30 }}
							className="absolute bottom-16 sm:bottom-14 left-4 sm:left-6 w-[calc(100%-2rem)] sm:w-80 z-50 bg-[#0a0a0a]/90 backdrop-blur-3xl border border-white/10 shadow-[0_10px_50px_-10px_rgba(0,0,0,0.5)] p-4 rounded-2xl overflow-hidden ring-1 ring-white/5"
						>
							<div className="absolute inset-x-0 top-0 h-[120px] bg-linear-to-b from-emerald-500/10 via-emerald-500/5 to-transparent pointer-events-none" />

							<div className="relative z-10">
								<div className="flex items-center gap-4 mb-6">
									<div className="relative group">
										<div className="absolute -inset-4 bg-emerald-500 blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 rounded-full" />
										<Image
											src="/me.jpg"
											alt="Anurag Basuri"
											width={52}
											height={52}
											className="w-13 h-13 rounded-full border-2 border-white/10 relative z-10 shadow-lg hover:scale-105 transition-transform duration-300"
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
											<button
												key={item.id}
												ref={index === 0 ? firstMenuItemRef : null}
												onClick={() => handleNavigate(item.id)}
												className="w-full text-left px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-all text-sm flex items-center gap-3 group relative overflow-hidden"
											>
												<div className="p-2 rounded-lg bg-white/5 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors shadow-sm">
													<IconComponent className="w-4 h-4" />
												</div>
												<div className="flex-1 flex flex-col">
													<span className="font-medium tracking-wide">
														{item.label}
													</span>
													<span className="text-xs text-white/40">
														{item.description}
													</span>
												</div>
												<ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
											</button>
										);
									})}
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
														className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:text-white hover:bg-emerald-500/20 hover:border-emerald-500/30 border border-transparent transition-all duration-200"
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
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													onClick={() => {
														router.push('/');
													}}
													className="h-9 px-4 flex items-center gap-2 rounded-xl text-white/40 hover:text-white hover:bg-red-500/20 transition-all text-xs font-bold uppercase tracking-wider group"
												>
													<Power className="w-3.5 h-3.5 group-hover:text-red-400 transition-colors" />
													<span>Restart</span>
												</button>
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
			<div className="w-full shrink-0 h-14 sm:h-12 bg-[#050505]/85 backdrop-blur-2xl backdrop-saturate-200 border-t border-white/10 flex items-center justify-between z-40 px-3 sm:px-6 lg:px-8 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.5)] relative">
				{/* Top Glow Line */}
				<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-500/30 to-transparent opacity-50" />

				<div className="flex items-center gap-3 sm:gap-4 h-full w-full sm:w-auto overflow-x-auto scrollbar-hide">
					{/* Start Button */}
					<Tooltip>
						<TooltipTrigger asChild>
							<motion.button
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								ref={startButtonRef}
								onClick={() => setIsStartOpen(!isStartOpen)}
								className={cn(
									'h-9 sm:h-8 px-3 rounded-lg flex items-center gap-2.5 transition-all duration-300 relative group shrink-0 border overflow-hidden',
									isStartOpen
										? 'bg-emerald-500/20 border-emerald-500/30 text-white shadow-[0_0_20px_rgba(52,211,153,0.2)]'
										: 'bg-white/5 border-white/10 text-white/90 hover:bg-white/10 hover:border-white/20',
								)}
							>
								<Logo />
								<span className="text-[11px] font-bold tracking-[0.15em] uppercase hidden lg:block">
									Start
								</span>

								{/* Animated Glow on Hover */}
								{!isStartOpen && (
									<div className="absolute inset-0 bg-linear-to-tr from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
								)}
							</motion.button>
						</TooltipTrigger>
						<TooltipContent
							side="top"
							className="bg-black/80 backdrop-blur text-white border-white/10"
						>
							System Menu
						</TooltipContent>
					</Tooltip>

					{/* Divider */}
					<div className="h-6 w-px bg-white/10 shrink-0" />

					{/* Taskbar Items with AnimatePresence */}
					<div className="flex items-center gap-1.5 sm:gap-2 h-full">
						<LayoutGroup>
							<AnimatePresence mode="popLayout" initial={false}>
								{openFiles.map(({ moduleId }) => (
									<TaskbarNavItem
										key={moduleId}
										moduleId={moduleId}
										isActive={currentModule === moduleId}
										onClick={() => handleNavigate(moduleId)}
										onClose={handleCloseItem}
									/>
								))}
							</AnimatePresence>
						</LayoutGroup>
					</div>
				</div>

				{/* Right Side Actions */}
				{!isMobile && (
					<div className="flex items-center pl-4 border-l border-white/5">
						{/* Clock or localized status could go here */}

						<HelpButton placement="taskbar" />
					</div>
				)}
			</div>
		</TooltipProvider>
	);
});
