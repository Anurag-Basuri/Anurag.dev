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
	HelpCircle,
	Terminal,
	Command,
	Keyboard,
	Folder,
	ArrowRight,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAtom } from 'jotai';
import { openFilesAtom } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Shared Animation Config
// ============================================================================

const PANEL_ANIMATION = {
	initial: { opacity: 0, y: 12 },
	animate: { opacity: 1, y: 0 },
	exit: { opacity: 0, y: 12 },
	transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
};

const BACKDROP_ANIMATION = {
	initial: { opacity: 0 },
	animate: { opacity: 1 },
	exit: { opacity: 0 },
	transition: { duration: 0.15 },
};

// ============================================================================
// Shared Button Styles
// ============================================================================

const getTaskbarButtonStyles = (isActive: boolean) =>
	cn(
		'h-6 px-2 rounded-md flex items-center justify-center gap-1.5',
		'transition-all duration-200',
		'hover:scale-105 active:scale-95',
		'focus:outline-none focus:ring-2 focus:ring-emerald-400/40',
		isActive
			? 'bg-emerald-500/15 text-white border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
			: 'bg-transparent text-white/70 border border-transparent hover:bg-white/5 hover:text-white hover:border-white/10',
	);

// ============================================================================
// Logo Component
// ============================================================================

const Logo = memo(function Logo({ isActive = false }: { isActive?: boolean }) {
	return (
		<div className="w-4 h-4 flex items-center justify-center relative">
			<div
				className={cn(
					'w-full h-full border-[1.5px] rounded-sm rotate-45 flex items-center justify-center',
					'transition-all duration-200',
					isActive
						? 'border-emerald-400 bg-emerald-500/25 scale-110'
						: 'border-emerald-500/60 bg-emerald-500/10',
				)}
			>
				<div
					className={cn(
						'w-1.5 h-1.5 rounded-full transition-all duration-200',
						isActive
							? 'bg-emerald-300 shadow-[0_0_10px_rgba(52,211,153,1)]'
							: 'bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)]',
					)}
				/>
			</div>
			{isActive && (
				<div className="absolute inset-0 bg-emerald-500/30 blur-lg rounded-full pointer-events-none animate-pulse" />
			)}
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
// Shared Hook: usePopover
// ============================================================================

function usePopover() {
	const [isOpen, setIsOpen] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);
	const toggle = useCallback(() => setIsOpen(prev => !prev), []);

	// Escape to close
	useEffect(() => {
		if (!isOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				close();
				triggerRef.current?.focus();
			}
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [isOpen, close]);

	// Click outside to close
	useEffect(() => {
		if (!isOpen) return;
		const handleClickOutside = (e: MouseEvent) => {
			const target = e.target as Node;
			if (!panelRef.current?.contains(target) && !triggerRef.current?.contains(target)) {
				close();
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [isOpen, close]);

	// Tab trap
	const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
		if (!panelRef.current || e.key !== 'Tab') return;

		const focusables = Array.from(
			panelRef.current.querySelectorAll<HTMLElement>(
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

	return { isOpen, open, close, toggle, panelRef, triggerRef, handleKeyDown };
}

// ============================================================================
// Panel Header Component (shared between Start and Help)
// ============================================================================

const PanelHeader = memo(function PanelHeader({
	icon: Icon,
	title,
	subtitle,
	onClose,
}: {
	icon: LucideIcon;
	title: string;
	subtitle?: string;
	onClose: () => void;
}) {
	return (
		<div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent">
			<div className="flex items-center gap-2.5">
				<div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
					<Icon className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
				</div>
				<div>
					<h3 className="font-semibold text-sm text-white">{title}</h3>
					{subtitle && <p className="text-[10px] text-white/40">{subtitle}</p>}
				</div>
			</div>
			<button
				onClick={onClose}
				className={cn(
					'w-6 h-6 flex items-center justify-center rounded-md',
					'text-white/40 hover:text-white hover:bg-white/10',
					'transition-all duration-150',
					'focus:outline-none focus:ring-2 focus:ring-emerald-400/40',
				)}
				aria-label="Close"
			>
				<X className="w-3.5 h-3.5" aria-hidden="true" />
			</button>
		</div>
	);
});

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

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<button
					onClick={onClick}
					className={cn(
						'relative flex items-center gap-1.5 cursor-pointer group',
						'h-6 px-2 rounded-md',
						'transition-all duration-200',
						'focus:outline-none focus:ring-2 focus:ring-emerald-400/40',
						'active:scale-95 hover:scale-105',
						isActive
							? 'bg-white/10 text-white shadow-[0_0_12px_rgba(52,211,153,0.2)]'
							: 'bg-transparent text-white/50 hover:bg-white/5 hover:text-white/80',
					)}
				>
					{/* Active indicator */}
					{isActive && (
						<div className="absolute inset-x-1 -bottom-[1px] h-[2px] rounded-full bg-emerald-400" />
					)}

					<IconComponent
						className={cn(
							'w-3.5 h-3.5 shrink-0 transition-colors duration-200',
							isActive
								? 'text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.5)]'
								: 'text-current',
						)}
						aria-hidden="true"
					/>

					<span
						className={cn(
							'text-[11px] font-medium truncate max-w-[72px]',
							'hidden sm:block',
							'transition-colors duration-200',
						)}
					>
						{title}
					</span>

					{/* Close button - shows on hover */}
					{onClose && (
						<button
							onClick={e => {
								e.stopPropagation();
								onClose(moduleId);
							}}
							className={cn(
								'ml-0.5 p-0.5 rounded-md',
								'opacity-0 group-hover:opacity-100',
								'hover:bg-white/15 active:bg-white/20',
								'transition-all duration-150',
								'focus:outline-none focus:opacity-100',
							)}
							aria-label={`Close ${title}`}
						>
							<X className="w-2.5 h-2.5" aria-hidden="true" />
						</button>
					)}
				</button>
			</TooltipTrigger>
			<TooltipContent side="top" sideOffset={8}>
				<p>{title}</p>
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
				<a
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					className={cn(
						'w-8 h-8 flex items-center justify-center rounded-lg',
						'text-white/30 hover:text-white',
						'bg-transparent hover:bg-white/10',
						'transition-all duration-200',
						'hover:scale-105 active:scale-95',
						'focus:outline-none focus:ring-2 focus:ring-emerald-400/40',
					)}
				>
					<Icon className="w-4 h-4" aria-hidden="true" />
				</a>
			</TooltipTrigger>
			<TooltipContent side="top">
				<p>{label}</p>
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
		<button
			ref={index === 0 ? firstItemRef : null}
			onClick={() => onNavigate(item.id)}
			className={cn(
				'w-full text-left px-3 py-2.5 rounded-xl',
				'text-white/70 hover:bg-white/5 hover:text-white',
				'transition-all duration-200',
				'flex items-center gap-3 group',
				'focus:outline-none focus:bg-white/5 focus:ring-2 focus:ring-emerald-400/40',
				'hover:scale-[1.01] active:scale-[0.99]',
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
				<IconComponent
					className="w-4 h-4 text-white/50 group-hover:text-emerald-400 transition-colors"
					aria-hidden="true"
				/>
			</div>
			<div className="flex-1 min-w-0">
				<span className="block text-sm font-medium truncate">{item.label}</span>
				<span className="block text-[10px] text-white/30 truncate">{item.description}</span>
			</div>
			<ChevronRight
				className="w-4 h-4 text-white/10 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all"
				aria-hidden="true"
			/>
		</button>
	);
});

// ============================================================================
// Help Panel Content
// ============================================================================

const HelpPanelContent = memo(function HelpPanelContent() {
	const commands = [
		{ cmd: 'help', desc: 'List all commands', icon: Command },
		{ cmd: 'about', desc: 'About me', icon: Sparkles },
		{ cmd: 'projects', desc: 'View my work', icon: Folder },
		{ cmd: 'contact', desc: 'Get in touch', icon: ArrowRight },
	];

	const shortcuts = [
		{ keys: ['Ctrl', 'B'], desc: 'Toggle sidebar' },
		{ keys: ['Ctrl', 'J'], desc: 'Toggle terminal' },
		{ keys: ['Tab'], desc: 'Autocomplete' },
		{ keys: ['↑', '↓'], desc: 'History' },
	];

	return (
		<div className="p-4 space-y-4">
			{/* Commands Section */}
			<div>
				<h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 flex items-center gap-1.5">
					<Command className="w-3 h-3" aria-hidden="true" />
					Commands
				</h4>
				<div className="grid gap-1">
					{commands.map((item, i) => {
						const Icon = item.icon;
						return (
							<div
								key={i}
								className="flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors group cursor-default"
							>
								<div className="w-6 h-6 rounded-md bg-white/5 group-hover:bg-emerald-500/10 flex items-center justify-center transition-colors">
									<Icon className="w-3 h-3 text-white/40 group-hover:text-emerald-400 transition-colors" />
								</div>
								<span className="flex-1 text-[11px] text-white/60 group-hover:text-white/80 transition-colors">
									{item.desc}
								</span>
								<code className="text-[10px] bg-white/5 group-hover:bg-emerald-500/15 px-2 py-0.5 rounded-md font-mono text-white/50 group-hover:text-emerald-400 transition-colors">
									{item.cmd}
								</code>
							</div>
						);
					})}
				</div>
			</div>

			{/* Divider */}
			<div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

			{/* Shortcuts Section */}
			<div>
				<h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 flex items-center gap-1.5">
					<Keyboard className="w-3 h-3" aria-hidden="true" />
					Shortcuts
				</h4>
				<div className="grid grid-cols-2 gap-1.5">
					{shortcuts.map((item, i) => (
						<div
							key={i}
							className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-white/[0.02] hover:bg-white/5 transition-colors"
						>
							<span className="text-[10px] text-white/50">{item.desc}</span>
							<div className="flex items-center gap-0.5">
								{item.keys.map((key, j) => (
									<kbd
										key={j}
										className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded bg-white/10 text-[9px] font-mono text-white/70 border border-white/5"
									>
										{key}
									</kbd>
								))}
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Pro Tip */}
			<div className="flex items-start gap-2.5 p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-transparent border border-emerald-500/10">
				<Terminal className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
				<p className="text-[11px] text-white/60 leading-relaxed">
					<span className="text-emerald-400 font-medium">Pro tip:</span> Type{' '}
					<code className="text-emerald-300 bg-emerald-500/10 px-1 rounded">help</code> in
					the terminal for all commands.
				</p>
			</div>
		</div>
	);
});

// ============================================================================
// Main Taskbar Component
// ============================================================================

export const Taskbar = memo(function Taskbar({ isMobile = false }: { isMobile?: boolean }) {
	const router = useRouter();
	const pathname = usePathname();
	const [openFilesState, setOpenFilesState] = useAtom(openFilesAtom);

	// Popover states
	const {
		isOpen: isStartOpen,
		open: openStartMenu,
		close: closeStartMenu,
		toggle: toggleStartMenu,
		panelRef: startPanelRef,
		triggerRef: startTriggerRef,
		handleKeyDown: handleStartKeyDown,
	} = usePopover();

	const {
		isOpen: isHelpOpen,
		open: openHelpMenu,
		close: closeHelpMenu,
		toggle: toggleHelpMenu,
		panelRef: helpPanelRef,
		triggerRef: helpTriggerRef,
		handleKeyDown: handleHelpKeyDown,
	} = usePopover();

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

	// Focus first menu item when Start opens
	useEffect(() => {
		if (isStartOpen) {
			setTimeout(() => firstMenuItemRef.current?.focus(), 50);
		}
	}, [isStartOpen]);

	// Navigation
	const handleNavigate = useCallback(
		(moduleId: string) => {
			const safeId = normalizeModuleId(moduleId);
			if (!safeId) return;
			closeStartMenu();
			router.push(getModulePath(safeId));
		},
		[router, closeStartMenu],
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
		<TooltipProvider delayDuration={300}>
			{/* ================================================================ */}
			{/* START MENU POPOVER */}
			{/* ================================================================ */}
			<AnimatePresence>
				{isStartOpen && (
					<>
						<motion.div
							{...BACKDROP_ANIMATION}
							onClick={closeStartMenu}
							className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
						/>
						<motion.div
							ref={startPanelRef}
							tabIndex={0}
							onKeyDown={handleStartKeyDown}
							{...PANEL_ANIMATION}
							className="fixed bottom-10 left-2 sm:left-4 w-[calc(100%-1rem)] sm:w-80 z-50"
						>
							<div className="bg-[#080808]/95 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-2xl overflow-hidden">
								{/* Header with close button */}
								<div className="p-4 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-b border-white/5">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="relative">
												<Image
													src="/me.jpg"
													alt="Anurag Basuri"
													width={48}
													height={48}
													className="w-12 h-12 rounded-xl border border-white/10 shadow-lg object-cover"
													priority
												/>
												<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#080808] shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
											</div>
											<div className="flex-1 min-w-0">
												<div className="font-semibold text-white text-sm flex items-center gap-1.5">
													Anurag Basuri
													<Sparkles
														className="w-3 h-3 text-emerald-400"
														aria-hidden="true"
													/>
												</div>
												<div className="text-xs text-white/40">
													Full-Stack Engineer
												</div>
											</div>
										</div>
										<button
											onClick={closeStartMenu}
											className={cn(
												'w-6 h-6 flex items-center justify-center rounded-md',
												'text-white/40 hover:text-white hover:bg-white/10',
												'transition-all duration-150',
												'focus:outline-none focus:ring-2 focus:ring-emerald-400/40',
											)}
											aria-label="Close menu"
										>
											<X className="w-3.5 h-3.5" aria-hidden="true" />
										</button>
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
								<div className="p-3 border-t border-white/5 bg-white/[0.02]">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-0.5">
											{socialLinks.map(link => (
												<SocialLink key={link.label} {...link} />
											))}
										</div>
										<Tooltip>
											<TooltipTrigger asChild>
												<button
													onClick={() => router.push('/')}
													className={cn(
														'h-8 px-3 flex items-center gap-2 rounded-lg',
														'text-white/40 hover:text-red-400',
														'hover:bg-red-500/10',
														'transition-all duration-200',
														'hover:scale-105 active:scale-95',
														'text-xs font-medium',
														'focus:outline-none focus:ring-2 focus:ring-red-400/40',
													)}
												>
													<Power
														className="w-3.5 h-3.5"
														aria-hidden="true"
													/>
													<span className="hidden sm:block">Restart</span>
												</button>
											</TooltipTrigger>
											<TooltipContent side="top">
												<p>Restart Session</p>
											</TooltipContent>
										</Tooltip>
									</div>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* ================================================================ */}
			{/* HELP MENU POPOVER */}
			{/* ================================================================ */}
			<AnimatePresence>
				{isHelpOpen && (
					<>
						<motion.div
							{...BACKDROP_ANIMATION}
							onClick={closeHelpMenu}
							className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
						/>
						<motion.div
							ref={helpPanelRef}
							tabIndex={0}
							onKeyDown={handleHelpKeyDown}
							{...PANEL_ANIMATION}
							className="fixed bottom-10 right-2 sm:right-4 w-[calc(100%-1rem)] sm:w-80 z-50"
						>
							<div className="bg-[#080808]/95 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] rounded-2xl overflow-hidden">
								<PanelHeader
									icon={Terminal}
									title="Quick Help"
									subtitle="Commands & shortcuts"
									onClose={closeHelpMenu}
								/>
								<HelpPanelContent />
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* ================================================================ */}
			{/* MAIN TASKBAR */}
			{/* ================================================================ */}
			<footer
				className="h-8 px-2 sm:px-3 md:px-4 lg:px-6 bg-[#050505]/80 backdrop-blur-xl backdrop-saturate-150 border-t border-white/5 shadow-sm flex items-center justify-between z-40 relative select-none"
				role="contentinfo"
			>
				{/* Top gradient border */}
				<div
					className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"
					aria-hidden="true"
				/>

				{/* Left Section */}
				<div className="flex items-center gap-1.5 sm:gap-2 h-full flex-1 min-w-0">
					{/* Start Button */}
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								ref={startTriggerRef}
								onClick={toggleStartMenu}
								className={getTaskbarButtonStyles(isStartOpen)}
								aria-label="System Menu"
								aria-expanded={isStartOpen}
								aria-haspopup="menu"
							>
								<Logo isActive={isStartOpen} />
								<span className="text-[10px] font-bold tracking-[0.15em] uppercase hidden md:block">
									Start
								</span>
							</button>
						</TooltipTrigger>
						<TooltipContent side="top">
							<p>System Menu</p>
						</TooltipContent>
					</Tooltip>

					{/* Divider */}
					<div className="w-px h-3.5 bg-white/10 mx-0.5" aria-hidden="true" />

					{/* Open Tabs */}
					<div className="flex items-center gap-1 h-full min-w-0 flex-1 overflow-x-auto scrollbar-hide">
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
					</div>
				</div>

				{/* Right Section */}
				{!isMobile && (
					<div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 pl-2 border-l border-white/10">
						{/* Help Button - matches Start button styling exactly */}
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									ref={helpTriggerRef}
									onClick={toggleHelpMenu}
									className={getTaskbarButtonStyles(isHelpOpen)}
									aria-label="Quick Help"
									aria-expanded={isHelpOpen}
									aria-haspopup="dialog"
								>
									<HelpCircle
										className={cn(
											'w-3.5 h-3.5 transition-all duration-200',
											isHelpOpen &&
												'text-emerald-400 drop-shadow-[0_0_4px_rgba(52,211,153,0.5)]',
										)}
										aria-hidden="true"
									/>
									<span className="text-[10px] font-bold tracking-[0.15em] uppercase hidden md:block">
										Help
									</span>
								</button>
							</TooltipTrigger>
							<TooltipContent side="top">
								<p>Quick Help</p>
							</TooltipContent>
						</Tooltip>
					</div>
				)}
			</footer>
		</TooltipProvider>
	);
});
