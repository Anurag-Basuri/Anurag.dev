'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Terminal, HelpCircle, X, Folder, Key } from 'lucide-react';

type HelpButtonProps = {
	placement?: 'floating' | 'taskbar';
	className?: string;
};

export function HelpButton({ placement = 'floating', className }: HelpButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const panelRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);

	const commands = [
		{ cmd: 'help', desc: 'List commands' },
		{ cmd: 'about', desc: 'About me' },
		{ cmd: 'projects', desc: 'My work' },
		{ cmd: 'journey', desc: 'Career path' },
		{ cmd: 'contact', desc: 'Get in touch' },
		{ cmd: 'theme toggle', desc: 'Switch theme' },
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
						'fixed bottom-6 right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center justify-center group',
						className,
					)}
					aria-label="Help"
					ref={triggerRef}
				>
					<HelpCircle className="w-5 h-5 sm:w-6 sm:h-6" />
					<span className="absolute -top-1 -right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-accent rounded-full animate-ping" />
				</motion.button>
			) : (
				<Tooltip>
					<TooltipTrigger asChild>
						<button
							onClick={() => setIsOpen(true)}
							className={cn(
								'h-8 px-2 rounded-md border border-border/50 bg-background/60 hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/40',
								className,
							)}
							aria-label="Quick Help"
							ref={triggerRef}
						>
							<HelpCircle className="w-4 h-4" />
							<span className="text-[11px] sm:text-xs">Help</span>
						</button>
					</TooltipTrigger>
					<TooltipContent>Quick Help</TooltipContent>
				</Tooltip>
			)}

			{/* Help Popover */}
			<AnimatePresence>
				{isOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsOpen(false)}
							className="fixed inset-0 bg-black/35 sm:bg-black/20 backdrop-blur-sm z-40"
						/>

						{/* Popover */}
						<motion.div
							initial={{ opacity: 0, scale: 0.9, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.9, y: 20 }}
							transition={{ type: 'spring', duration: 0.3 }}
							className={cn(
								'fixed z-50',
								// Mobile: full-width bottom sheet
								'max-sm:left-0 max-sm:right-0 max-sm:bottom-0 max-sm:w-full max-sm:p-3',
								// Desktop: compact panel near trigger
								'sm:w-80',
								placement === 'floating'
									? 'sm:bottom-24 sm:right-6'
									: 'sm:bottom-16 sm:right-6',
							)}
							ref={panelRef}
						>
							<div
								className={cn(
									'bg-background/95 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden',
									'rounded-t-2xl sm:rounded-2xl',
								)}
							>
								{/* Header */}
								<div className="p-4 border-b border-border/50 bg-linear-to-r from-primary/10 to-accent/10 flex justify-between items-center">
									<h3 className="font-semibold flex items-center gap-2 text-sm sm:text-base">
										<Terminal className="w-4 h-4" />
										<span>Quick Help</span>
									</h3>
									<button
										onClick={() => setIsOpen(false)}
										className="p-2 sm:p-1 hover:bg-muted/50 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
										aria-label="Close help"
									>
										<X className="w-5 h-5 sm:w-4 sm:h-4" />
									</button>
								</div>

								{/* Content */}
								<div className="p-4 space-y-4 text-sm sm:text-[13px]">
									<div>
										<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
											Common Commands
										</h4>
										<div className="space-y-2">
											{commands.map((item, i) => (
												<div
													key={i}
													className="flex items-start gap-3 p-2 rounded hover:bg-muted/30 transition-colors group"
												>
													<code className="text-xs sm:text-[11px] bg-muted px-2 py-1 rounded font-mono text-primary shrink-0">
														{item.cmd}
													</code>
													<span className="text-xs sm:text-[11px] text-muted-foreground group-hover:text-foreground transition-colors">
														{item.desc}
													</span>
												</div>
											))}
										</div>
									</div>

									<div className="pt-3 border-t border-border/50">
										<h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
											Tips
										</h4>
										<ul className="space-y-2 text-xs sm:text-[11px] text-muted-foreground">
											<li className="flex items-start gap-2">
												<Folder className="w-3 h-3 mt-0.5 shrink-0" />
												<span>Click files in Explorer to open them</span>
											</li>
											<li className="flex items-start gap-2">
												<Key className="w-3 h-3 mt-0.5 shrink-0" />
												<span>Press Tab to autocomplete</span>
											</li>
											<li className="flex items-start gap-2">
												<Terminal className="w-3 h-3 mt-0.5 shrink-0" />
												<span>Use ↑/↓ for command history</span>
											</li>
										</ul>
									</div>
								</div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</TooltipProvider>
	);
}
