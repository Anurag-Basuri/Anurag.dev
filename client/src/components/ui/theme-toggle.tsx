'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div className="h-8 w-8 rounded-lg bg-muted/60 animate-pulse" />;
	}

	const isDark = theme === 'dark';

	return (
		<div className="relative">
			<TooltipProvider delayDuration={400}>
				<Tooltip>
					<TooltipTrigger asChild>
						<motion.button
							whileHover={{ scale: 1.08 }}
							whileTap={{ scale: 0.92 }}
							onClick={() => setTheme(isDark ? 'light' : 'dark')}
							className="relative h-8 w-8 rounded-lg bg-muted/60 hover:bg-muted border border-border/60 hover:border-primary/40 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50 overflow-hidden"
							aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
						>
							{/* Ambient glow effect */}
							<motion.div
								className="absolute inset-0 rounded-lg"
								animate={{
									boxShadow: isDark
										? 'inset 0 0 12px rgba(251, 191, 36, 0.15)'
										: 'inset 0 0 12px rgba(99, 102, 241, 0.12)',
								}}
								transition={{ duration: 0.4 }}
							/>

							<AnimatePresence mode="wait" initial={false}>
								{isDark ? (
									<motion.div
										key="sun"
										initial={{ rotate: -90, scale: 0, opacity: 0 }}
										animate={{ rotate: 0, scale: 1, opacity: 1 }}
										exit={{ rotate: 90, scale: 0, opacity: 0 }}
										transition={{
											type: 'spring',
											stiffness: 200,
											damping: 15,
										}}
										className="absolute"
									>
										<Sun className="h-4 w-4 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" />
									</motion.div>
								) : (
									<motion.div
										key="moon"
										initial={{ rotate: 90, scale: 0, opacity: 0 }}
										animate={{ rotate: 0, scale: 1, opacity: 1 }}
										exit={{ rotate: -90, scale: 0, opacity: 0 }}
										transition={{
											type: 'spring',
											stiffness: 200,
											damping: 15,
										}}
										className="absolute"
									>
										<Moon className="h-4 w-4 text-primary drop-shadow-[0_0_4px_rgba(99,102,241,0.4)]" />
									</motion.div>
								)}
							</AnimatePresence>
						</motion.button>
					</TooltipTrigger>
					<TooltipContent side="bottom" className="text-xs">
						{isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
}
