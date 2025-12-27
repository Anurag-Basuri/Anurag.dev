'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
	Terminal,
	HelpCircle,
	X,
	Folder,
	Keyboard,
	Command,
	Sparkles,
	ArrowRight,
} from 'lucide-react';

type HelpButtonProps = {
	placement?: 'floating' | 'taskbar';
	className?: string;
};

export function HelpButton({ placement = 'floating', className }: HelpButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const closeBtnRef = useRef<HTMLButtonElement>(null);

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
		{ keys: ['↑', '↓'], desc: 'Command history' },
	];

	// Close with Esc and restore focus to trigger
	useEffect(() => {
		if (!isOpen) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setIsOpen(false);
				triggerRef.current?.focus();
			}
		};
		document.addEventListener('keydown', onKey);
		return () => document.removeEventListener('keydown', onKey);
	}, [isOpen]);

	// Focus the close button for immediate keyboard access
	useEffect(() => {
		if (!isOpen) return;
		closeBtnRef.current?.focus();
	}, [isOpen]);

	// Trap Tab inside the panel when open
	const handlePanelKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (!isOpen || !panelRef.current) return;
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
			panelRef.current.querySelectorAll<HTMLElement>(focusableSelectors),
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

	// Close panel when clicking outside
	useEffect(() => {
		if (!isOpen) return;
		const handleDocMouseDown = (e: MouseEvent) => {
			const target = e.target as Node | null;
			const panelEl = panelRef.current;
			const triggerEl = triggerRef.current;
			if (!panelEl || !triggerEl) return;
			const clickedInsidePanel = panelEl.contains(target as Node);
			const clickedTrigger = triggerEl.contains(target as Node);
			if (!clickedInsidePanel && !clickedTrigger) {
				setIsOpen(false);
			}
		};
		document.addEventListener('mousedown', handleDocMouseDown);
		return () => document.removeEventListener('mousedown', handleDocMouseDown);
	}, [isOpen]);

	return (
		<TooltipProvider delayDuration={0}>
			{/* Trigger */}
			{placement === 'floating' ? (
				<motion.button
					initial={{ scale: 0, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ delay: 1, type: 'spring' }}
					onClick={() => setIsOpen(!isOpen)}
					className={cn(
						'fixed bottom-6 right-6 z-40',
						'w-11 h-11 sm:w-12 sm:h-12',
						'bg-linear-to-br from-emerald-500 to-emerald-600',
						'text-white rounded-full',
						'shadow-lg shadow-emerald-500/25',
						'hover:shadow-xl hover:shadow-emerald-500/30',
						'hover:scale-105 active:scale-95',
						'transition-all duration-200',
						'flex items-center justify-center',
						'ring-2 ring-white/10 ring-offset-2 ring-offset-black/50',
						className,
					)}
					aria-label="Help"
					ref={triggerRef}
				>
					<HelpCircle className="w-5 h-5" />
				</motion.button>
			) : (
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							onClick={() => setIsOpen(true)}
							className={cn(
								'h-6 px-2.5 rounded-md',
								'flex items-center justify-center gap-1.5',
								'transition-all duration-200 group',
								'bg-transparent hover:bg-emerald-500/10',
								'text-white/60 hover:text-emerald-400',
								'border border-transparent hover:border-emerald-500/20',
								'focus:outline-none focus:ring-1 focus:ring-emerald-500/30',
								className,
							)}
							aria-label="Quick Help"
							ref={triggerRef}
						>
							<HelpCircle className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
							<span className="text-[11px] font-medium tracking-wide hidden md:block">
								Help
							</span>
						</button>
					</TooltipTrigger>
					<TooltipContent side="top">
						<p className="text-xs">Quick Help</p>
					</TooltipContent>
				</Tooltip>
			)}

			{/* Help Popover */}
			{typeof document !== 'undefined' &&
				createPortal(
					<AnimatePresence>
						{isOpen && (
							<>
								{/* Backdrop */}
								<motion.div
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									onClick={() => setIsOpen(false)}
									className="fixed inset-0 bg-black/40 backdrop-blur-sm z-60"
								/>

								{/* Popover */}
								<motion.div
									initial={{ opacity: 0, scale: 0.95, y: 10 }}
									animate={{ opacity: 1, scale: 1, y: 0 }}
									exit={{ opacity: 0, scale: 0.95, y: 10 }}
									transition={{ type: 'spring', duration: 0.25, bounce: 0.1 }}
									className={cn(
										'fixed z-60',
										// Mobile: full-width bottom sheet
										'max-sm:left-2 max-sm:right-2 max-sm:bottom-2',
										// Desktop: compact panel near trigger
										'sm:w-80',
										placement === 'floating'
											? 'sm:bottom-20 sm:right-6'
											: 'sm:bottom-12 sm:right-4',
									)}
									ref={panelRef}
									onKeyDown={handlePanelKeyDown}
								>
									<div className="bg-[#0a0a0a]/95 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/50 rounded-2xl overflow-hidden">
										{/* Header */}
										<div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-linear-to-r from-emerald-500/10 via-emerald-500/5 to-transparent">
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
												onClick={() => setIsOpen(false)}
												className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors text-white/40 hover:text-white focus:outline-none"
												aria-label="Close help"
												ref={closeBtnRef}
											>
												<X className="w-3.5 h-3.5" />
											</button>
										</div>

										<div className="p-4 space-y-4">
											{/* Commands Section */}
											<div>
												<h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 flex items-center gap-1.5">
													<Command className="w-3 h-3" />
													Terminal Commands
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
											<div className="h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

											{/* Shortcuts Section */}
											<div>
												<h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-2 flex items-center gap-1.5">
													<Keyboard className="w-3 h-3" />
													Keyboard Shortcuts
												</h4>
												<div className="grid grid-cols-2 gap-1.5">
													{shortcuts.map((item, i) => (
														<div
															key={i}
															className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-white/2 hover:bg-white/5 transition-colors"
														>
															<span className="text-[10px] text-white/50">
																{item.desc}
															</span>
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
											<div className="flex items-start gap-2.5 p-3 rounded-xl bg-linear-to-br from-emerald-500/10 to-transparent border border-emerald-500/10">
												<Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
												<p className="text-[11px] text-white/60 leading-relaxed">
													<span className="text-emerald-400 font-medium">
														Pro tip:
													</span>{' '}
													Type{' '}
													<code className="text-emerald-300">help</code>{' '}
													in the terminal to see all available commands.
												</p>
											</div>
										</div>
									</div>
								</motion.div>
							</>
						)}
					</AnimatePresence>,
					document.body,
				)}
		</TooltipProvider>
	);
}
