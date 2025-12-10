'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);
	const [showTooltip, setShowTooltip] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div className="w-8 h-8" />;
	}

	const isDark = theme === 'dark';

	return (
		<div className="relative">
			<TooltipProvider delayDuration={0}>
				<Tooltip>
					<TooltipTrigger asChild>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setTheme(isDark ? 'light' : 'dark')}
							className="relative h-8 w-8 rounded-md bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
							aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
						>
							{/* Sun icon */}
							<motion.div
								className="absolute inset-0 flex items-center justify-center"
								initial={false}
								animate={{
									rotate: isDark ? -90 : 0,
									scale: isDark ? 0 : 1,
									opacity: isDark ? 0 : 1,
								}}
								transition={{ duration: 0.2 }}
							>
								<Sun className="h-4 w-4 text-orange-400" />
							</motion.div>

							{/* Moon icon */}
							<motion.div
								className="absolute inset-0 flex items-center justify-center"
								initial={false}
								animate={{
									rotate: isDark ? 0 : 90,
									scale: isDark ? 1 : 0,
									opacity: isDark ? 1 : 0,
								}}
								transition={{ duration: 0.2 }}
							>
								<Moon className="h-4 w-4 text-emerald-400" />
							</motion.div>
						</motion.button>
					</TooltipTrigger>
					<TooltipContent side="bottom">
						{isDark ? 'Light mode' : 'Dark mode'}
					</TooltipContent>
				</Tooltip>
			</TooltipProvider>
		</div>
	);
}