'use client';

// This component is responsible for rendering the theme selector dropdown in the navbar. It uses the theme context to get the current theme and available themes, and allows the user to switch between them.

import { motion, AnimatePresence } from 'framer-motion';
import { useAppTheme } from './theme-context';
import { Palette, Check, Sun, Moon, Eclipse } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/ui/tooltip';

const BRIGHTNESS_ICON: Record<string, React.FC<{ className?: string }>> = {
	dark: Moon,
	light: Sun,
	medium: Eclipse,
};

export function ThemeSelector() {
	const { themeName, setTheme, availableThemes, isDark } = useAppTheme();
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
		<div className="relative shrink-0" ref={containerRef}>
			<Tooltip>
				<TooltipTrigger asChild>
					<motion.button
						whileHover={{ scale: 1.08 }}
						whileTap={{ scale: 0.92 }}
						onClick={() => setOpen(v => !v)}
						className="relative flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 bg-background/20 backdrop-blur-3xl transition-colors hover:bg-accent focus:outline-none shrink-0"
						aria-label="Change theme"
					>
						<Palette className="h-4 w-4 text-(--theme-primary)" />
					</motion.button>
				</TooltipTrigger>
				<TooltipContent side="bottom" sideOffset={12}>Environment Hue</TooltipContent>
			</Tooltip>

			<AnimatePresence>
				{open && (
					<motion.div
						initial={{ opacity: 0, y: 8, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 6, scale: 0.95 }}
						transition={{ duration: 0.15 }}
						className="absolute right-0 top-10 z-50 w-56 overflow-hidden rounded-xl border border-border/40 bg-background/30 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.6)] backdrop-blur-3xl"
					>
						<p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
							Theme
						</p>

						{availableThemes.map(t => {
							const isActive = t.name === themeName;
							const BrightnessIcon = BRIGHTNESS_ICON[t.brightness] ?? Moon;

							return (
								<button
									key={t.name}
									onClick={() => {
										setTheme(t.name);
										setOpen(false);
									}}
									className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all duration-300 ease-out active:scale-[0.98] ${
										isActive
											? 'bg-accent text-foreground'
											: 'text-muted-foreground hover:bg-primary/10 hover:text-primary hover:scale-[1.02]'
									}`}
								>
									{/* Color swatch */}
									<span
										className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-inner"
										style={{
											background: `linear-gradient(135deg, ${t.bg} 40%, ${t.primary})`,
											border: `1px solid ${t.primary}30`,
										}}
									>
										<BrightnessIcon
											className="h-3 w-3"
											style={{ color: t.primary }}
										/>
									</span>

									<span className="flex-1 font-medium">{t.label}</span>

									{isActive && (
										<Check
											className="h-3.5 w-3.5"
											style={{ color: t.primary }}
										/>
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
