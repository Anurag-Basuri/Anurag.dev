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
import { HelpButton } from '@/components/common/HelpButton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useAtom } from 'jotai';
import { openFilesAtom } from '@/store';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// Constants (static, defined once at module load)
// ============================================================================

const ANIMATION = {
	panel: {
		initial: { opacity: 0, y: 8 },
		animate: { opacity: 1, y: 0 },
		exit: { opacity: 0, y: 8 },
		transition: { duration: 0.15 },
	},
	backdrop: {
		initial: { opacity: 0 },
		animate: { opacity: 1 },
		exit: { opacity: 0 },
		transition: { duration: 0.1 },
	},
} as const;

const SOCIAL_LINKS = [
	{ href: 'https://github.com/Anurag-Basuri', icon: Github, label: 'GitHub' },
	{
		href: 'https://www.linkedin.com/in/anurag-basuri-941546214/',
		icon: Linkedin,
		label: 'LinkedIn',
	},
	{ href: 'https://twitter.com/AnuragBasuri', icon: Twitter, label: 'Twitter' },
	{ href: 'https://instagram.com/anurag.basuri', icon: Instagram, label: 'Instagram' },
] as const;

const HELP_COMMANDS = [
	{ cmd: 'help', desc: 'List commands', icon: Command },
	{ cmd: 'about', desc: 'About me', icon: Sparkles },
	{ cmd: 'projects', desc: 'My work', icon: Folder },
	{ cmd: 'contact', desc: 'Contact', icon: ArrowRight },
] as const;

const HELP_SHORTCUTS = [
	{ keys: ['Ctrl', 'B'], desc: 'Sidebar' },
	{ keys: ['Ctrl', 'J'], desc: 'Terminal' },
	{ keys: ['Tab'], desc: 'Complete' },
	{ keys: ['↑↓'], desc: 'History' },
] as const;

const VALID_MODULE_IDS = new Set<ModuleId>(getAllModuleIds());

const MODULE_ICONS: Record<ModuleId, LucideIcon> = (() => {
	const icons = {} as Record<ModuleId, LucideIcon>;
	for (const id of VALID_MODULE_IDS) icons[id] = getModuleIcon(id);
	return icons;
})();

const MENU_ITEMS = navigationItems.map(item => ({ ...item, icon: MODULE_ICONS[item.id] }));

// ============================================================================
// Helpers
// ============================================================================

const normalizeModuleId = (id: string): ModuleId | null =>
	id && isValidModule(id) ? (id as ModuleId) : null;

const btnStyles = (active: boolean) =>
	cn(
		'h-6 px-2 rounded-md flex items-center justify-center gap-1.5 transition-colors duration-150',
		'focus:outline-none focus:ring-2 focus:ring-emerald-400/40',
		active
			? 'bg-emerald-500/15 text-white border border-emerald-500/30'
			: 'bg-transparent text-white/70 border border-transparent hover:bg-white/5 hover:text-white',
	);

// ============================================================================
// Hooks
// ============================================================================

function usePopover() {
	const [isOpen, setIsOpen] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	const close = useCallback(() => setIsOpen(false), []);
	const toggle = useCallback(() => setIsOpen(p => !p), []);

	useEffect(() => {
		if (!isOpen) return;

		const onEsc = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				close();
				triggerRef.current?.focus();
			}
		};

		const onClick = (e: MouseEvent) => {
			const t = e.target as Node;
			if (!panelRef.current?.contains(t) && !triggerRef.current?.contains(t)) {
				close();
			}
		};

		document.addEventListener('keydown', onEsc);
		document.addEventListener('mousedown', onClick);

		return () => {
			document.removeEventListener('keydown', onEsc);
			document.removeEventListener('mousedown', onClick);
		};
	}, [isOpen, close]);

	// Focus trap handler - defined as a regular function for ref safety
	const handleTrapFocus = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (!panelRef.current || e.key !== 'Tab') return;

		const els = Array.from(
			panelRef.current.querySelectorAll<HTMLElement>(
				'button, a[href], [tabindex]:not([tabindex="-1"])',
			),
		);
		if (!els.length) return;

		const [first, last] = [els[0], els[els.length - 1]];
		if (!e.shiftKey && document.activeElement === last) {
			e.preventDefault();
			first.focus();
		} else if (e.shiftKey && document.activeElement === first) {
			e.preventDefault();
			last.focus();
		}
	};

	return { isOpen, close, toggle, panelRef, triggerRef, trapFocus: handleTrapFocus };
}

// ============================================================================
// Components
// ============================================================================

const Logo = memo(({ active = false }: { active?: boolean }) => (
	<div className="w-4 h-4 flex items-center justify-center relative">
		<div
			className={cn(
				'w-full h-full border-[1.5px] rounded-sm rotate-45 flex items-center justify-center transition-colors',
				active
					? 'border-emerald-400 bg-emerald-500/25'
					: 'border-emerald-500/60 bg-emerald-500/10',
			)}
		>
			<div
				className={cn(
					'w-1.5 h-1.5 rounded-full',
					active ? 'bg-emerald-300' : 'bg-emerald-400',
				)}
			/>
		</div>
	</div>
));
Logo.displayName = 'Logo';

const NavItem = memo(
	({
		moduleId,
		isActive,
		onClick,
		onClose,
	}: {
		moduleId: ModuleId;
		isActive: boolean;
		onClick: () => void;
		onClose?: (id: string) => void;
	}) => {
		const Icon = MODULE_ICONS[moduleId];
		const title = getModuleTitle(moduleId);
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						onClick={onClick}
						className={cn(
							'relative flex items-center gap-1.5 h-6 px-2 rounded-md group transition-colors',
							isActive
								? 'bg-white/10 text-white'
								: 'text-white/50 hover:bg-white/5 hover:text-white/80',
						)}
					>
						{isActive && (
							<div className="absolute inset-x-1 -bottom-px h-0.5 rounded-full bg-emerald-400" />
						)}
						<Icon className={cn('w-3.5 h-3.5', isActive && 'text-emerald-400')} />
						<span className="text-[11px] font-medium truncate max-w-[72px] hidden sm:block">
							{title}
						</span>
						{onClose && (
							<button
								onClick={e => {
									e.stopPropagation();
									onClose(moduleId);
								}}
								className="ml-0.5 p-0.5 rounded opacity-0 group-hover:opacity-100 hover:bg-white/15"
								aria-label={`Close ${title}`}
							>
								<X className="w-2.5 h-2.5" />
							</button>
						)}
					</button>
				</TooltipTrigger>
				<TooltipContent side="top">
					<p>{title}</p>
				</TooltipContent>
			</Tooltip>
		);
	},
);
NavItem.displayName = 'NavItem';

const SocialLink = memo(
	({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) => (
		<Tooltip>
			<TooltipTrigger asChild>
				<a
					href={href}
					target="_blank"
					rel="noopener noreferrer"
					className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/10 transition-colors"
				>
					<Icon className="w-4 h-4" />
				</a>
			</TooltipTrigger>
			<TooltipContent side="top">
				<p>{label}</p>
			</TooltipContent>
		</Tooltip>
	),
);
SocialLink.displayName = 'SocialLink';

const MenuItem = memo(
	({
		item,
		index,
		onNavigate,
		firstRef,
	}: {
		item: (typeof MENU_ITEMS)[0];
		index: number;
		onNavigate: (id: string) => void;
		firstRef: React.RefObject<HTMLButtonElement | null>;
	}) => {
		const Icon = item.icon;
		return (
			<button
				ref={index === 0 ? firstRef : null}
				onClick={() => onNavigate(item.id)}
				className="w-full text-left px-3 py-2 rounded-lg text-white/70 hover:bg-white/5 hover:text-white flex items-center gap-3 group transition-colors"
			>
				<div className="w-8 h-8 rounded-lg bg-white/5 group-hover:bg-emerald-500/15 flex items-center justify-center transition-colors">
					<Icon className="w-4 h-4 text-white/50 group-hover:text-emerald-400 transition-colors" />
				</div>
				<div className="flex-1 min-w-0">
					<span className="block text-sm font-medium truncate">{item.label}</span>
					<span className="block text-[10px] text-white/30 truncate">
						{item.description}
					</span>
				</div>
				<ChevronRight className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-colors" />
			</button>
		);
	},
);
MenuItem.displayName = 'MenuItem';

const HelpContent = memo(() => (
	<div className="p-4 space-y-3">
		<div>
			<h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 flex items-center gap-1.5">
				<Command className="w-3 h-3" /> Commands
			</h4>
			<div className="grid gap-1">
				{HELP_COMMANDS.map((c, i) => (
					<div
						key={i}
						className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors group"
					>
						<div className="w-6 h-6 rounded bg-white/5 group-hover:bg-emerald-500/10 flex items-center justify-center">
							<c.icon className="w-3 h-3 text-white/40 group-hover:text-emerald-400 transition-colors" />
						</div>
						<span className="flex-1 text-[11px] text-white/60">{c.desc}</span>
						<code className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded font-mono text-white/50">
							{c.cmd}
						</code>
					</div>
				))}
			</div>
		</div>
		<div className="h-px bg-white/10" />
		<div>
			<h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 flex items-center gap-1.5">
				<Keyboard className="w-3 h-3" /> Shortcuts
			</h4>
			<div className="grid grid-cols-2 gap-1">
				{HELP_SHORTCUTS.map((s, i) => (
					<div
						key={i}
						className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-white/2"
					>
						<span className="text-[10px] text-white/50">{s.desc}</span>
						<div className="flex gap-0.5">
							{s.keys.map((k, j) => (
								<kbd
									key={j}
									className="min-w-[18px] h-4 px-1 flex items-center justify-center rounded bg-white/10 text-[9px] font-mono text-white/70"
								>
									{k}
								</kbd>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
		<div className="flex items-start gap-2 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/10">
			<Terminal className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
			<p className="text-[11px] text-white/60">
				<span className="text-emerald-400 font-medium">Tip:</span> Type{' '}
				<code className="text-emerald-300">help</code> in terminal
			</p>
		</div>
	</div>
));
HelpContent.displayName = 'HelpContent';

// ============================================================================
// Main Component
// ============================================================================

export const Taskbar = memo(function Taskbar({ isMobile = false }: { isMobile?: boolean }) {
	const router = useRouter();
	const pathname = usePathname();
	const [openFiles, setOpenFiles] = useAtom(openFilesAtom);
	const firstItemRef = useRef<HTMLButtonElement>(null);

	const startMenu = usePopover();
	const helpMenu = usePopover();

	const currentModule = useMemo((): ModuleId | null => {
		if (pathname === '/portfolio' || pathname === '/portfolio/') return null;
		return normalizeModuleId(pathname.replace('/portfolio/', '').replace(/^\/+/, ''));
	}, [pathname]);

	const validFiles = useMemo(
		() => openFiles.map(f => normalizeModuleId(f.moduleId)).filter((m): m is ModuleId => !!m),
		[openFiles],
	);

	useEffect(() => {
		if (startMenu.isOpen) setTimeout(() => firstItemRef.current?.focus(), 50);
	}, [startMenu.isOpen]);

	const navigate = useCallback(
		(id: string) => {
			const safe = normalizeModuleId(id);
			if (!safe) return;
			startMenu.close();
			router.push(getModulePath(safe));
		},
		[router, startMenu],
	);

	const closeTab = useCallback(
		(id: string) => {
			const rest = validFiles.filter(m => m !== id);
			setOpenFiles(p => p.filter(f => f.moduleId !== id));
			router.push(rest.length ? `/portfolio/${rest[rest.length - 1]}` : '/portfolio');
		},
		[validFiles, router, setOpenFiles],
	);

	return (
		<TooltipProvider delayDuration={300}>
			{/* Start Menu */}
			<AnimatePresence>
				{startMenu.isOpen && (
					<>
						<motion.div
							{...ANIMATION.backdrop}
							onClick={startMenu.close}
							className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
						/>
						<motion.div
							ref={startMenu.panelRef}
							tabIndex={0}
							onKeyDown={startMenu.trapFocus}
							{...ANIMATION.panel}
							className="fixed bottom-10 left-2 sm:left-4 w-[calc(100%-1rem)] sm:w-80 z-50"
						>
							<div className="bg-[#080808]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
								<div className="p-4 bg-linear-to-br from-emerald-500/10 to-transparent border-b border-white/5">
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-3">
											<div className="relative">
												<Image
													src="/me.jpg"
													alt="Anurag Basuri"
													width={48}
													height={48}
													className="w-12 h-12 rounded-xl border border-white/10 object-cover"
													priority
												/>
												<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#080808]" />
											</div>
											<div>
												<div className="font-semibold text-white text-sm flex items-center gap-1.5">
													Anurag Basuri{' '}
													<Sparkles className="w-3 h-3 text-emerald-400" />
												</div>
												<div className="text-xs text-white/40">
													Full-Stack Engineer
												</div>
											</div>
										</div>
										<button
											onClick={startMenu.close}
											className="w-6 h-6 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
										>
											<X className="w-3.5 h-3.5" />
										</button>
									</div>
								</div>
								<div className="p-2 grid gap-0.5">
									{MENU_ITEMS.map((item, i) => (
										<MenuItem
											key={item.id}
											item={item}
											index={i}
											onNavigate={navigate}
											firstRef={firstItemRef}
										/>
									))}
								</div>
								<div className="p-3 border-t border-white/5 bg-white/2 flex items-center justify-between">
									<div className="flex gap-0.5">
										{SOCIAL_LINKS.map(l => (
											<SocialLink key={l.label} {...l} />
										))}
									</div>
									<Tooltip>
										<TooltipTrigger asChild>
											<button
												onClick={() => router.push('/')}
												className="h-8 px-3 flex items-center gap-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors"
											>
												<Power className="w-3.5 h-3.5" />
												<span className="hidden sm:block">Restart</span>
											</button>
										</TooltipTrigger>
										<TooltipContent side="top">
											<p>Restart Session</p>
										</TooltipContent>
									</Tooltip>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Help Menu */}
			<AnimatePresence>
				{helpMenu.isOpen && (
					<>
						<motion.div
							{...ANIMATION.backdrop}
							onClick={helpMenu.close}
							className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
						/>
						<motion.div
							ref={helpMenu.panelRef}
							tabIndex={0}
							onKeyDown={helpMenu.trapFocus}
							{...ANIMATION.panel}
							className="fixed bottom-10 right-2 sm:right-4 w-[calc(100%-1rem)] sm:w-80 z-50"
						>
							<div className="bg-[#080808]/95 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl overflow-hidden">
								<div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-linear-to-r from-emerald-500/10 to-transparent">
									<div className="flex items-center gap-2.5">
										<div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center">
											<Terminal className="w-3.5 h-3.5 text-emerald-400" />
										</div>
										<div>
											<h3 className="font-semibold text-sm text-white">
												Quick Help
											</h3>
											<p className="text-[10px] text-white/40">
												Commands & shortcuts
											</p>
										</div>
									</div>
									<button
										onClick={helpMenu.close}
										className="w-6 h-6 flex items-center justify-center rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors"
									>
										<X className="w-3.5 h-3.5" />
									</button>
								</div>
								<HelpContent />
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Mobile FAB */}
			{isMobile && <HelpButton onClick={helpMenu.toggle} />}

			{/* Main Bar */}
			<footer className="h-8 px-2 sm:px-3 md:px-4 lg:px-6 bg-[#050505]/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-between z-40 relative select-none">
				<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-emerald-500/30 to-transparent" />
				<div className="flex items-center gap-1.5 sm:gap-2 h-full flex-1 min-w-0">
					<Tooltip>
						<TooltipTrigger asChild>
							<button
								ref={startMenu.triggerRef}
								onClick={startMenu.toggle}
								className={btnStyles(startMenu.isOpen)}
								aria-label="System Menu"
								aria-expanded={startMenu.isOpen}
								aria-haspopup="menu"
							>
								<Logo active={startMenu.isOpen} />
								<span className="text-[10px] font-bold tracking-[0.15em] uppercase hidden md:block">
									Start
								</span>
							</button>
						</TooltipTrigger>
						<TooltipContent side="top">
							<p>System Menu</p>
						</TooltipContent>
					</Tooltip>
					<div className="w-px h-3.5 bg-white/10 mx-0.5" />
					<div className="flex items-center gap-1 h-full min-w-0 flex-1 overflow-x-auto scrollbar-hide">
						{validFiles.map(id => (
							<NavItem
								key={id}
								moduleId={id}
								isActive={currentModule === id}
								onClick={() => navigate(id)}
								onClose={closeTab}
							/>
						))}
					</div>
				</div>
				{!isMobile && (
					<div className="flex items-center gap-1 pl-2 border-l border-white/10">
						<Tooltip>
							<TooltipTrigger asChild>
								<button
									ref={helpMenu.triggerRef}
									onClick={helpMenu.toggle}
									className={btnStyles(helpMenu.isOpen)}
									aria-label="Quick Help"
									aria-expanded={helpMenu.isOpen}
									aria-haspopup="dialog"
								>
									<HelpCircle
										className={cn(
											'w-3.5 h-3.5',
											helpMenu.isOpen && 'text-emerald-400',
										)}
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
