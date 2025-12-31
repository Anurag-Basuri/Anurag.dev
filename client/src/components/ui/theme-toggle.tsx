'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = React.useState(false);

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return <div className="w-8 h-8" />;
	}

	const isDark = theme === 'dark';

	return (
		<div className="relative">
			<TooltipProvider delayDuration={500} skipDelayDuration={200}>
				<Tooltip>
					<TooltipTrigger asChild>
						<motion.button
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setTheme(isDark ? 'light' : 'dark')}
							className="relative h-8 w-8 rounded-md bg-muted/50 hover:bg-muted border border-border/50 hover:border-border flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring/40"
							aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
						>
							{/* Sun icon - visible in dark mode */}
							<motion.div
								className="absolute inset-0 flex items-center justify-center"
								initial={false}
								animate={{
									rotate: isDark ? 0 : -90,
									scale: isDark ? 1 : 0,
									opacity: isDark ? 1 : 0,
								}}
								transition={{ duration: 0.2 }}
							>
								<Sun className="h-4 w-4 text-amber-400" />
							</motion.div>

							{/* Moon icon - visible in light mode */}
							<motion.div
								className="absolute inset-0 flex items-center justify-center"
								initial={false}
								animate={{
									rotate: isDark ? 90 : 0,
									scale: isDark ? 0 : 1,
									opacity: isDark ? 0 : 1,
								}}
								transition={{ duration: 0.2 }}
							>
								<Moon className="h-4 w-4 text-primary" />
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
