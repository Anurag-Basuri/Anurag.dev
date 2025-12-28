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
	Clock as ClockIcon,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpButton } from '@/components/common/HelpButton';
import { useAtom } from 'jotai';
import { openFilesAtom } from '@/store';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

// ============================================================================
// Constants & Animation Configs
// ============================================================================

const SPRING_CONFIG = { type: 'spring', stiffness: 400, damping: 30 } as const;
const SPRING_SOFT = { type: 'spring', stiffness: 300, damping: 25 } as const;

// ============================================================================
// Logo Component
// ============================================================================

const Logo = memo(function Logo({ isActive = false }: { isActive?: boolean }) {
	return (
		<div className="w-4 h-4 flex items-center justify-center relative">
			<motion.div
				animate={{
					rotate: 45,
					scale: isActive ? 1.1 : 1,
				}}
				transition={SPRING_CONFIG}
				className={cn(
					'w-full h-full border-[1.5px] rounded-sm flex items-center justify-center',
					'transition-colors duration-200',
					isActive
						? 'border-emerald-400 bg-emerald-500/25'
						: 'border-emerald-500/60 bg-emerald-500/10',
				)}
			>
				<motion.div
					animate={{
						scale: isActive ? [1, 1.2, 1] : 1,
						opacity: isActive ? 1 : 0.8,
					}}
					transition={{
						scale: { duration: 0.3, times: [0, 0.5, 1] },
						opacity: { duration: 0.2 },
					}}
					className={cn(
						'w-1.5 h-1.5 rounded-full',
						isActive
							? 'bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,1)]'
							: 'bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]',
					)}
				/>
			</motion.div>
			<AnimatePresence>
				{isActive && (
					<motion.div
						initial={{ opacity: 0, scale: 0.5 }}
						animate={{ opacity: 0.6, scale: 1.5 }}
						exit={{ opacity: 0, scale: 0.5 }}
						transition={SPRING_SOFT}
						className="absolute inset-0 bg-emerald-500/30 blur-lg rounded-full pointer-events-none"
					/>
				)}
			</AnimatePresence>
		</div>
	);
});

// ============================================================================
// Clock Component
// ============================================================================

const TaskbarClock = memo(function ClockComponent() {
	const [time, setTime] = useState<string>('');

	useEffect(() => {
		const updateTime = () => {
			setTime(
				new Date().toLocaleTimeString('en-US', {
					hour: '2-digit',
					minute: '2-digit',
					hour12: true,
				}),
			);
		};
		updateTime();
		const interval = setInterval(updateTime, 1000);
		return () => clearInterval(interval);
	}, []);

	if (!time) return null;

	return (
		<div className="hidden lg:flex items-center gap-1.5 px-2 text-[10px] text-white/40 font-mono tabular-nums">
			<ClockIcon className="w-3 h-3" />
			<span>{time}</span>
		</div>
	);
});

// ============================================================================
// Module Helpers
// ============================================================================

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

// ============================================================================
// TaskbarNavItem Component
// ============================================================================

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
	const [isHovered, setIsHovered] = useState(false);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<motion.button
					layout="position"
					layoutId={`tab-${moduleId}`}
					initial={{ opacity: 0, scale: 0.9, x: -8 }}
					animate={{ opacity: 1, scale: 1, x: 0 }}
					exit={{ opacity: 0, scale: 0.9, x: -8 }}
					transition={SPRING_CONFIG}
					onClick={onClick}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					className={cn(
						'relative flex items-center gap-1.5 cursor-pointer',
						'h-6 px-2.5 rounded-lg',
						'transition-colors duration-150',
						'focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/50',
						isActive
							? 'bg-white/10 text-white'
							: 'bg-transparent text-white/50 hover:bg-white/5 hover:text-white/80',
					)}
				>
					{/* Active indicator pill */}
					{isActive && (
						<motion.div
							layoutId="active-indicator"
							className="absolute inset-x-2 -bottom-[1px] h-[2px] rounded-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-emerald-400"
							transition={SPRING_SOFT}
						/>
					)}

					{/* Hover glow effect */}
					<AnimatePresence>
						{isHovered && !isActive && (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								transition={{ duration: 0.15 }}
								className="absolute inset-0 rounded-lg bg-gradient-to-t from-white/5 to-transparent pointer-events-none"
							/>
						)}
					</AnimatePresence>

					<IconComponent
						className={cn(
							'w-3.5 h-3.5 shrink-0 transition-all duration-200',
							isActive
								? 'text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.5)]'
								: 'text-current',
						)}
					/>

					<span
						className={cn(
							'text-[11px] font-medium truncate max-w-[72px]',
							'hidden sm:block',
							'transition-colors duration-150',
						)}
					>
						{title}
					</span>

					{/* Close button */}
					{onClose && (
						<AnimatePresence>
							{(isHovered || isActive) && (
								<motion.button
									initial={{ opacity: 0, scale: 0.8 }}
									animate={{ opacity: 1, scale: 1 }}
									exit={{ opacity: 0, scale: 0.8 }}
									transition={{ duration: 0.1 }}
									onClick={e => {
										e.stopPropagation();
										onClose(moduleId);
									}}
									className={cn(
										'ml-0.5 p-0.5 rounded-md',
										'hover:bg-white/15 active:bg-white/20',
										'transition-colors duration-100',
									)}
									aria-label={`Close ${title}`}
								>
									<X className="w-2.5 h-2.5" />
								</motion.button>
							)}
						</AnimatePresence>
					)}
				</motion.button>
			</TooltipTrigger>
			<TooltipContent
				side="top"
				sideOffset={8}
				className="text-xs font-medium bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 shadow-xl"
			>
				{title}
			</TooltipContent>
		</Tooltip>
	);
});

// ============================================================================
// Social Link Component
// ============================================================================

const SocialLink = memo(function SocialLink({
	href,
	icon: Icon,
	label,
}: {
	href: string;
	icon: LucideIcon;
	label: string;
}) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<motion.a
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					whileHover={{ scale: 1.05, y: -1 }}
					whileTap={{ scale: 0.95 }}
					className={cn(
						'w-8 h-8 flex items-center justify-center rounded-lg',
						'text-white/30 hover:text-white',
						'bg-transparent hover:bg-white/10',
						'transition-colors duration-200',
						'focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/50',
					)}
				>
					<Icon className="w-4 h-4" />
				</motion.a>
			</TooltipTrigger>
			<TooltipContent side="top" className="text-xs">
				{label}
			</TooltipContent>
		</Tooltip>
	);
});

// ============================================================================
// Start Menu Item Component
// ============================================================================

const StartMenuItem = memo(function StartMenuItem({
	item,
	index,
	onNavigate,
	firstItemRef,
}: {
	item: { id: ModuleId; label: string; description: string; icon: ModuleIconComponent };
	index: number;
	onNavigate: (id: string) => void;
	firstItemRef: React.RefObject<HTMLButtonElement | null>;
}) {
	const IconComponent = item.icon;

	return (
		<motion.button
			ref={index === 0 ? firstItemRef : null}
			onClick={() => onNavigate(item.id)}
			initial={{ opacity: 0, x: -12 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ delay: index * 0.03, ...SPRING_SOFT }}
			whileHover={{ x: 4 }}
			whileTap={{ scale: 0.98 }}
			className={cn(
				'w-full text-left px-3 py-2.5 rounded-xl',
				'text-white/70 hover:bg-white/5 hover:text-white',
				'transition-colors duration-150',
				'flex items-center gap-3 group',
				'focus:outline-none focus-visible:bg-white/5',
			)}
		>
			<div
				className={cn(
					'w-9 h-9 rounded-lg flex items-center justify-center',
					'bg-white/5 group-hover:bg-emerald-500/15',
					'border border-transparent group-hover:border-emerald-500/20',
					'transition-all duration-200',
				)}
			>
				<IconComponent className="w-4 h-4 text-white/50 group-hover:text-emerald-400 transition-colors" />
			</div>
			<div className="flex-1 min-w-0">
				<span className="block text-sm font-medium truncate">{item.label}</span>
				<span className="block text-[10px] text-white/30 truncate">{item.description}</span>
			</div>
			<ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
		</motion.button>
	);
});

// ============================================================================
// Main Taskbar Component
// ============================================================================

export const Taskbar = memo(function Taskbar({ isMobile = false }: { isMobile?: boolean }) {
	const router = useRouter();
	const pathname = usePathname();
	const [openFilesState, setOpenFilesState] = useAtom(openFilesAtom);
	const [isStartOpen, setIsStartOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);
	const startButtonRef = useRef<HTMLButtonElement>(null);
	const firstMenuItemRef = useRef<HTMLButtonElement>(null);

	// Current active module
	const currentModule = useMemo((): ModuleId | null => {
		if (pathname === '/portfolio' || pathname === '/portfolio/') return null;
		const segment = pathname.replace('/portfolio/', '').replace(/^\/+/, '');
		return normalizeModuleId(segment);
	}, [pathname]);

	// Valid open files
	const visibleOpenFiles = useMemo(() => {
		return openFilesState
			.map(f => ({ moduleId: normalizeModuleId(f.moduleId), openedAt: f.openedAt }))
			.filter((f): f is { moduleId: ModuleId; openedAt: number } => Boolean(f.moduleId));
	}, [openFilesState]);

	// Keyboard: Escape to close
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

	// Focus first menu item when opened
	useEffect(() => {
		if (isStartOpen) {
			setTimeout(() => firstMenuItemRef.current?.focus(), 50);
		}
	}, [isStartOpen]);

	// Click outside to close
	useEffect(() => {
		if (!isStartOpen) return;
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as Node;
			if (!menuRef.current?.contains(target) && !startButtonRef.current?.contains(target)) {
				setIsStartOpen(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isStartOpen]);

	// Tab trap for accessibility
	const handleMenuKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
		if (!menuRef.current || e.key !== 'Tab') return;

		const focusables = Array.from(
			menuRef.current.querySelectorAll<HTMLElement>(
				'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
			),
		);

		if (focusables.length === 0) return;

		const first = focusables[0];
		const last = focusables[focusables.length - 1];
		const active = document.activeElement as HTMLElement;

		if (!e.shiftKey && active === last) {
			e.preventDefault();
			first.focus();
		} else if (e.shiftKey && active === first) {
			e.preventDefault();
			last.focus();
		}
	}, []);

	// Navigation
	const handleNavigate = useCallback(
		(moduleId: string) => {
			const safeId = normalizeModuleId(moduleId);
			if (!safeId) return;
			setIsStartOpen(false);
			router.push(getModulePath(safeId));
		},
		[router],
	);

	// Close tab logic
	const handleCloseItem = useCallback(
		(moduleId: string) => {
			const remaining = visibleOpenFiles.filter(f => f.moduleId !== moduleId);
			const nextModule = remaining.length > 0 ? remaining[remaining.length - 1].moduleId : '';

			setOpenFilesState(prev => prev.filter(f => f.moduleId !== moduleId));
			router.push(nextModule ? `/portfolio/${nextModule}` : '/portfolio');
		},
		[visibleOpenFiles, router, setOpenFilesState],
	);

	const socialLinks = [
		{ href: 'https://github.com/Anurag-Basuri', icon: Github, label: 'GitHub' },
		{
			href: 'https://www.linkedin.com/in/anurag-basuri-941546214/',
			icon: Linkedin,
			label: 'LinkedIn',
		},
		{ href: 'https://twitter.com/AnuragBasuri', icon: Twitter, label: 'Twitter' },
		{ href: 'https://instagram.com/anurag.basuri', icon: Instagram, label: 'Instagram' },
	];

	return (
		<TooltipProvider delayDuration={400} skipDelayDuration={100}>
			{/* Start Menu */}
			<AnimatePresence>
				{isStartOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.15 }}
							onClick={() => setIsStartOpen(false)}
							className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
						/>

						{/* Menu Panel */}
						<motion.div
							ref={menuRef}
							tabIndex={0}
							onKeyDown={handleMenuKeyDown}
							initial={{ opacity: 0, y: 16, scale: 0.96 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 16, scale: 0.96 }}
							transition={SPRING_CONFIG}
							className="fixed bottom-12 left-2 sm:left-4 w-[calc(100%-1rem)] sm:w-80 z-50"
						>
							<div className="bg-[#080808]/98 backdrop-blur-2xl border border-white/10 shadow-2xl shadow-black/60 rounded-2xl overflow-hidden">
								{/* Profile Header */}
								<div className="p-4 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-b border-white/5">
									<div className="flex items-center gap-3">
										<div className="relative">
											<motion.div
												initial={{ scale: 0.9, opacity: 0 }}
												animate={{ scale: 1, opacity: 1 }}
												transition={{ delay: 0.05, ...SPRING_SOFT }}
											>
												<Image
													src="/me.jpg"
													alt="Anurag Basuri"
													width={48}
													height={48}
													className="w-12 h-12 rounded-xl border border-white/10 shadow-lg object-cover"
													priority
												/>
											</motion.div>
											<motion.div
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												transition={{
													delay: 0.1,
													type: 'spring',
													stiffness: 500,
												}}
												className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#080808] shadow-[0_0_8px_rgba(16,185,129,0.6)]"
											/>
										</div>
										<motion.div
											initial={{ opacity: 0, x: -8 }}
											animate={{ opacity: 1, x: 0 }}
											transition={{ delay: 0.08, ...SPRING_SOFT }}
											className="flex-1 min-w-0"
										>
											<div className="font-semibold text-white text-sm flex items-center gap-1.5">
												Anurag Basuri
												<Sparkles className="w-3 h-3 text-emerald-400" />
											</div>
											<div className="text-xs text-white/40">
												Full-Stack Engineer
											</div>
										</motion.div>
									</div>
								</div>

								{/* Navigation */}
								<div className="p-2">
									<div className="grid gap-0.5">
										{MENU_ITEMS_WITH_ICONS.map((item, index) => (
											<StartMenuItem
												key={item.id}
												item={item}
												index={index}
												onNavigate={handleNavigate}
												firstItemRef={firstMenuItemRef}
											/>
										))}
									</div>
								</div>

								{/* Footer */}
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.15 }}
									className="p-3 border-t border-white/5 bg-white/[0.02]"
								>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-0.5">
											{socialLinks.map(link => (
												<SocialLink key={link.label} {...link} />
											))}
										</div>

										<Tooltip>
											<TooltipTrigger asChild>
												<motion.button
													onClick={() => router.push('/')}
													whileHover={{ scale: 1.02 }}
													whileTap={{ scale: 0.98 }}
													className={cn(
														'h-8 px-3 flex items-center gap-2 rounded-lg',
														'text-white/40 hover:text-red-400',
														'hover:bg-red-500/10',
														'transition-colors duration-150',
														'text-xs font-medium',
													)}
												>
													<Power className="w-3.5 h-3.5" />
													<span className="hidden sm:block">Restart</span>
												</motion.button>
											</TooltipTrigger>
											<TooltipContent side="top" className="text-xs">
												Restart Session
											</TooltipContent>
										</Tooltip>
									</div>
								</motion.div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Main Taskbar */}
			<div
				className={cn(
					'w-full shrink-0 h-9 px-2 sm:px-3 md:px-4',
					'bg-[#050505]/85 backdrop-blur-xl backdrop-saturate-150',
					'border-t border-white/[0.06]',
					'flex items-center justify-between',
					'z-40 relative',
				)}
			>
				{/* Top gradient accent */}
				<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/25 to-transparent" />

				{/* Left section */}
				<div className="flex items-center gap-2 h-full flex-1 min-w-0">
					{/* Start Button */}
					<Tooltip>
						<TooltipTrigger asChild>
							<motion.button
								ref={startButtonRef}
								onClick={() => setIsStartOpen(!isStartOpen)}
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
								className={cn(
									'h-7 px-2.5 rounded-lg flex items-center justify-center gap-1.5',
									'transition-all duration-200 shrink-0',
									'border',
									'focus:outline-none focus-visible:ring-1 focus-visible:ring-emerald-500/50',
									isStartOpen
										? 'bg-emerald-500/15 text-white border-emerald-500/30 shadow-[0_0_16px_rgba(16,185,129,0.15)]'
										: 'bg-transparent text-white/60 border-transparent hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20',
								)}
							>
								<Logo isActive={isStartOpen} />
								<span className="text-[11px] font-semibold tracking-wide hidden md:block">
									Start
								</span>
							</motion.button>
						</TooltipTrigger>
						<TooltipContent
							side="top"
							sideOffset={8}
							className="bg-[#0a0a0a]/95 backdrop-blur-xl text-white border-white/10 text-xs"
						>
							System Menu
						</TooltipContent>
					</Tooltip>

					{/* Divider */}
					<div className="h-4 w-px bg-white/[0.06] shrink-0" />

					{/* Open Tabs */}
					<div className="flex items-center gap-1 h-full min-w-0 flex-1 overflow-x-auto scrollbar-hide">
						<LayoutGroup>
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
						</LayoutGroup>
					</div>
				</div>

				{/* Right section */}
				{!isMobile && (
					<div className="flex items-center gap-1 pl-2 border-l border-white/[0.06] shrink-0">
						<TaskbarClock />
						<HelpButton placement="taskbar" />
					</div>
				)}
			</div>
		</TooltipProvider>
	);
});
