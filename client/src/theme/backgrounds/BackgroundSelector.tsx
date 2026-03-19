'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useAtom } from 'jotai';
import { useState, useRef, useEffect } from 'react';
import { Check, ImageOff, Sparkles, Stars, Grid3X3 } from 'lucide-react';
import { backgroundModeAtom, type BackgroundMode } from './background';

const BACKGROUNDS: Array<{
	id: BackgroundMode;
	label: string;
	Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}> = [
	{ id: 'none', label: 'None', Icon: ImageOff },
	{ id: 'particles_wireframe', label: 'Particles', Icon: Sparkles },
	{ id: 'starfield_warp', label: 'Starfield', Icon: Stars },
	{ id: 'tech_grid', label: 'Tech Grid', Icon: Grid3X3 },
];

export function BackgroundSelector() {
	const [mode, setMode] = useAtom(backgroundModeAtom);
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		}
		if (open) {
			document.addEventListener('mousedown', handleClickOutside);
		}
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [open]);

	return (
		<div className="relative" ref={containerRef}>
			<motion.button
				whileHover={{ scale: 1.08 }}
				whileTap={{ scale: 0.92 }}
				onClick={() => setOpen(v => !v)}
				className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-foreground/5 backdrop-blur-md transition-colors hover:bg-accent focus:outline-none"
				aria-label="Change background"
			>
				<Stars className="h-4 w-4 text-(--theme-secondary)" />
			</motion.button>

			<AnimatePresence>
				{open && (
						<motion.div
							initial={{ opacity: 0, y: 8, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: 6, scale: 0.95 }}
							transition={{ duration: 0.15 }}
							className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-xl border border-border bg-popover/95 p-2 shadow-2xl backdrop-blur-2xl"
						>
							<p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
								Background
							</p>

							{BACKGROUNDS.map(b => {
								const isActive = b.id === mode;
								return (
									<button
										key={b.id}
										onClick={() => {
											setMode(b.id);
											setOpen(false);
										}}
										className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
											isActive
												? 'bg-accent text-foreground'
												: 'text-muted-foreground hover:bg-accent hover:text-foreground'
										}`}
									>
										<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-foreground/5 border border-border">
											<b.Icon
												className="h-3.5 w-3.5"
												color={
													isActive ? 'var(--theme-primary)' : 'var(--muted-foreground)'
												}
											/>
										</span>

										<span className="flex-1 font-medium">{b.label}</span>

										{isActive && (
											<Check className="h-3.5 w-3.5" style={{ color: 'var(--theme-primary)' }} />
										)}
									</button>
								);
							})}
						</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

