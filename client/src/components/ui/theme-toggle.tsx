'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);
	const [showTooltip, setShowTooltip] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div className="w-9 h-9" />; // Placeholder to prevent layout shift
	}

	const isDark = theme === 'dark';

	return (
		<div className="relative">
			<motion.button
				whileHover={{ scale: 1.08 }}
				whileTap={{ scale: 0.92 }}
				onClick={() => setTheme(isDark ? 'light' : 'dark')}
				onMouseEnter={() => setShowTooltip(true)}
				onMouseLeave={() => setShowTooltip(false)}
				className="relative p-2 rounded-lg bg-linear-to-br from-muted/40 to-muted/20 hover:from-muted/60 hover:to-muted/30 border border-border/50 hover:border-primary/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/50 shadow-sm hover:shadow-md group overflow-hidden"
				aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
			>
				{/* Background glow effect */}
				<motion.div
					className="absolute inset-0 bg-linear-to-r from-primary/0 via-primary/10 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
					animate={{
						x: ['-100%', '100%'],
					}}
					transition={{
						duration: 2,
						repeat: Infinity,
						ease: 'linear',
					}}
				/>

				{/* Sun icon */}
				<motion.div
					className="relative z-10"
					initial={false}
					animate={{
						rotate: isDark ? -90 : 0,
						scale: isDark ? 0 : 1,
						opacity: isDark ? 0 : 1,
					}}
					transition={{
						duration: 0.5,
						ease: [0.34, 1.56, 0.64, 1],
					}}
				>
					<Sun className="h-[1.1rem] w-[1.1rem] text-orange-500 drop-shadow-[0_0_8px_rgba(251,146,60,0.5)]" />
				</motion.div>

				{/* Moon icon */}
				<motion.div
					className="absolute top-2 left-2 z-10"
					initial={false}
					animate={{
						rotate: isDark ? 0 : 90,
						scale: isDark ? 1 : 0,
						opacity: isDark ? 1 : 0,
					}}
					transition={{
						duration: 0.5,
						ease: [0.34, 1.56, 0.64, 1],
					}}
				>
					<Moon className="h-[1.1rem] w-[1.1rem] text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" />
				</motion.div>
			</motion.button>

			{/* Tooltip */}
			<AnimatePresence>
				{showTooltip && (
					<motion.div
						initial={{ opacity: 0, y: 5, scale: 0.9 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 5, scale: 0.9 }}
						transition={{ duration: 0.15 }}
						className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover/95 backdrop-blur-md border border-border rounded text-xs text-popover-foreground whitespace-nowrap shadow-lg z-50"
					>
						{isDark ? 'Light mode' : 'Dark mode'}
						<div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-popover border-l border-t border-border rotate-45" />
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
