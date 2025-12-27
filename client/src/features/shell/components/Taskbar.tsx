'use client';

import { getModuleIcon, getModuleTitle } from '@/lib/moduleRegistry';
import {
	navigationItems,
	getAllModuleIds,
	getModulePath,
	isValidModule,
	type ModuleId,
} from '@/lib/routes';
import { cn } from '@/lib/utils';
import React, { memo, useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import {
	Power,
	Github,
	Linkedin,
	Twitter,
	X,
	type LucideIcon,
	ChevronRight,
	Instagram,
	Sparkles,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpButton } from '@/components/common/HelpButton';
import { useAtom } from 'jotai';
import { openFilesAtom, type OpenFile } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';

// Enhanced logo component with glow effect
const Logo = ({ isActive = false }: { isActive?: boolean }) => (
	<div className="w-4 h-4 flex items-center justify-center relative">
		<motion.div
			animate={isActive ? { rotate: 45, scale: 1.1 } : { rotate: 45, scale: 1 }}
			transition={{ type: 'spring', stiffness: 300, damping: 20 }}
			className={cn(
				'w-full h-full border-[1.5px] rounded-sm flex items-center justify-center transition-colors duration-200',
				isActive
					? 'border-emerald-400 bg-emerald-500/20'
					: 'border-emerald-500/70 bg-emerald-500/10',
			)}
		>
			<div
				className={cn(
					'w-1.5 h-1.5 rounded-full transition-all duration-200',
					isActive
						? 'bg-emerald-300 shadow-[0_0_8px_rgba(52,211,153,1)]'
						: 'bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.6)]',
				)}
			/>
		</motion.div>
		{isActive && (
			<motion.div
				initial={{ opacity: 0, scale: 0.5 }}
				animate={{ opacity: 1, scale: 1 }}
				className="absolute inset-0 bg-emerald-500/20 blur-md rounded-full"
			/>
		)}
	</div>
);

const VALID_MODULE_IDS = new Set<ModuleId>(getAllModuleIds());

const normalizeModuleId = (id: string): ModuleId | null => {
	if (!id) return null;
	if (!isValidModule(id)) return null;
	return id as ModuleId;
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
	moduleId: ModuleId;
	isActive: boolean;
	onClick: () => void;
	onClose?: (moduleId: string) => void;
}) {
	const IconComponent = MODULE_ICON_BY_ID[moduleId];
	const title = getModuleTitle(moduleId);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<motion.button
					layout
					initial={{ opacity: 0, x: -4 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: -4 }}
					transition={{ duration: 0.15, ease: 'easeOut' }}
					onClick={onClick}
					className={cn(
						'relative flex items-center gap-1.5 transition-colors duration-150 group cursor-pointer',
						'h-6 px-2 rounded-md',
						isActive
							? 'bg-white/10 text-white'
							: 'bg-transparent text-white/50 hover:bg-white/5 hover:text-white/70',
					)}
				>
					{isActive && (
						<motion.div
							layoutId="active-pill"
							className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-emerald-400"
							transition={{ duration: 0.2, ease: 'easeOut' }}
						/>
					)}

					<IconComponent
						className={cn(
							'w-3.5 h-3.5 shrink-0',
							isActive ? 'text-emerald-400' : 'text-current',
						)}
					/>

					<span
						className={cn(
							'text-[11px] font-medium truncate max-w-[80px]',
							'hidden sm:block',
						)}
					>
						{title}
					</span>

					{onClose && (
						<button
							onClick={e => {
								e.stopPropagation();
								onClose(moduleId);
							}}
							className="ml-0.5 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-white/10 transition-opacity duration-100"
							aria-label={`Close ${title}`}
						>
							<X className="w-2.5 h-2.5" />
						</button>
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

export const Taskbar = memo(function Taskbar({ isMobile = false }: { isMobile?: boolean }) {
	const router = useRouter();
	const pathname = usePathname();
	const [openFilesState, setOpenFilesState] = useAtom(openFilesAtom);
	const [isStartOpen, setIsStartOpen] = useState(false);
	const stateMenuRef = useRef<HTMLDivElement>(null);
	const startButtonRef = useRef<HTMLButtonElement>(null);
	const firstMenuItemRef = useRef<HTMLButtonElement>(null);

	// Get current module from pathname (root => no active tab)
	const currentModule = useMemo((): ModuleId | null => {
		if (pathname === '/portfolio' || pathname === '/portfolio/') return null;
		const maybe = pathname.replace('/portfolio/', '').replace(/^\/+/, '');
		return normalizeModuleId(maybe);
	}, [pathname]);

	// Determine visible open files with valid module IDs
	const visibleOpenFiles = useMemo(() => {
		return openFilesState
			.map(f => ({ moduleId: normalizeModuleId(f.moduleId), openedAt: f.openedAt }))
			.filter((f): f is { moduleId: ModuleId; openedAt: number } => Boolean(f.moduleId));
	}, [openFilesState]);

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

	// Navigate to module
	const handleNavigate = useCallback(
		(moduleId: string) => {
			const safeModuleId = normalizeModuleId(moduleId);
			if (!safeModuleId) return;
			setIsStartOpen(false);
			router.push(getModulePath(safeModuleId));
		},
		[router],
	);

	// Determine navigation target when closing a tab
	const getNavigationTarget = useCallback(
		(closingModuleId: string): string => {
			const remainingFiles = visibleOpenFiles.filter(f => f.moduleId !== closingModuleId);

			// If files remain, go to most recent (last in array)
			if (remainingFiles.length > 0) {
				return remainingFiles[remainingFiles.length - 1].moduleId;
			}

			// No files left - return empty string to go to root
			return '';
		},
		[visibleOpenFiles],
	);

	// Handle closing a tab
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

	// Detect if on mobile for conditional rendering
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
		{
			href: 'https://instagram.com/anurag.basuri',
			icon: Instagram,
			label: 'Instagram',
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
							className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
						/>

						{/* Start Menu Panel */}
						<motion.div
							ref={stateMenuRef}
							tabIndex={0}
							onKeyDown={handleMenuKeyDown}
							initial={{ opacity: 0, y: 12, scale: 0.98 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 12, scale: 0.98 }}
							transition={{ type: 'spring', duration: 0.25, bounce: 0.1 }}
							className="absolute bottom-12 left-2 sm:left-4 w-[calc(100%-1rem)] sm:w-80 z-50"
						>
							<div className="bg-[#080808]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 rounded-2xl overflow-hidden">
								{/* Header with profile */}
								<div className="p-4 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-b border-white/5">
									<div className="flex items-center gap-3">
										<div className="relative">
											<Image
												src="/me.jpg"
												alt="Anurag Basuri"
												width={48}
												height={48}
												className="w-12 h-12 rounded-xl border border-white/10 shadow-lg"
												priority
											/>
											<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#080808]" />
										</div>
										<div className="flex-1 min-w-0">
											<div className="font-semibold text-white text-sm flex items-center gap-1.5">
												Anurag Basuri
												<Sparkles className="w-3 h-3 text-emerald-400" />
											</div>
											<div className="text-xs text-white/40">
												Full-Stack Engineer
											</div>
										</div>
									</div>
								</div>

								{/* Navigation Grid */}
								<div className="p-2">
									<div className="grid gap-0.5">
										{menuItemsWithIcons.map((item, index) => {
											const IconComponent = item.icon;
											return (
												<motion.button
													key={item.id}
													ref={index === 0 ? firstMenuItemRef : null}
													onClick={() => handleNavigate(item.id)}
													whileHover={{ x: 2 }}
													whileTap={{ scale: 0.99 }}
													className="w-full text-left px-3 py-2.5 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-all flex items-center gap-3 group"
												>
													<div className="w-9 h-9 rounded-lg bg-white/5 group-hover:bg-emerald-500/15 flex items-center justify-center transition-all duration-200 border border-transparent group-hover:border-emerald-500/20">
														<IconComponent className="w-4 h-4 text-white/50 group-hover:text-emerald-400 transition-colors" />
													</div>
													<div className="flex-1 min-w-0">
														<span className="block text-sm font-medium truncate">
															{item.label}
														</span>
														<span className="block text-[10px] text-white/30 truncate">
															{item.description}
														</span>
													</div>
													<ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/30 group-hover:translate-x-0.5 transition-all" />
												</motion.button>
											);
										})}
									</div>
								</div>

								{/* Footer with social links */}
								<div className="p-3 border-t border-white/5 bg-white/[0.02]">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-1">
											{socialLinks.map(link => (
												<Tooltip key={link.label}>
													<TooltipTrigger asChild>
														<a
															href={link.href}
															target="_blank"
															rel="noopener noreferrer"
															className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-all duration-200"
														>
															<link.icon className="w-4 h-4" />
														</a>
													</TooltipTrigger>
													<TooltipContent side="top" className="text-xs">
														{link.label}
													</TooltipContent>
												</Tooltip>
											))}
										</div>

										<Tooltip>
											<TooltipTrigger asChild>
												<button
													onClick={() => router.push('/')}
													className="h-8 px-3 flex items-center gap-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-medium group"
												>
													<Power className="w-3.5 h-3.5" />
													<span className="hidden sm:block">Restart</span>
												</button>
											</TooltipTrigger>
											<TooltipContent side="top" className="text-xs">
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
			<div className="w-full shrink-0 h-8 px-2 sm:px-3 md:px-4 lg:px-6 bg-[#050505]/80 backdrop-blur-xl backdrop-saturate-150 border-t border-white/5 shadow-sm flex items-center justify-between z-40 relative">
				{/* Top gradient border */}
				<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

				<div className="flex items-center gap-1.5 sm:gap-2 h-full flex-1 min-w-0 overflow-x-auto scrollbar-hide">
					{/* Start Button */}
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								ref={startButtonRef}
								onClick={() => setIsStartOpen(!isStartOpen)}
								className={cn(
									'h-6 px-2 rounded-md flex items-center justify-center gap-1.5 transition-all duration-200 shrink-0',
									'border border-transparent',
									isStartOpen
										? 'bg-emerald-500/15 text-white border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
										: 'bg-transparent text-white/70 hover:bg-white/5 hover:text-white hover:border-white/5',
								)}
							>
								<Logo isActive={isStartOpen} />
								<span className="text-[11px] font-semibold tracking-wide hidden md:block">
									Start
								</span>
							</button>
						</TooltipTrigger>
						<TooltipContent
							side="top"
							className="bg-black/80 backdrop-blur text-white border-white/10 text-xs"
						>
							System Menu
						</TooltipContent>
					</Tooltip>

					{/* Divider */}
					<div className="h-4 w-px bg-white/5 shrink-0" />

					<div className="flex items-center gap-1 h-full min-w-0 flex-1">
						<AnimatePresence mode="popLayout" initial={false}>
							{openFilesState
								.map(f => normalizeModuleId(f.moduleId))
								.filter((m): m is ModuleId => Boolean(m))
								.map(moduleId => (
									<TaskbarNavItem
										key={moduleId}
										moduleId={moduleId}
										isActive={currentModule === moduleId}
										onClick={() => handleNavigate(moduleId)}
										onClose={handleCloseItem}
									/>
								))}
						</AnimatePresence>
					</div>
				</div>

				{/* Right Side Actions */}
				{!isMobile && (
					<div className="flex items-center pl-2 sm:pl-3 md:pl-4 border-l border-white/5 shrink-0">
						{/* Clock or localized status could go here */}

						<HelpButton placement="taskbar" />
					</div>
				)}
			</div>
		</TooltipProvider>
	);
});
