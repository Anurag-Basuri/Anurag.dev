'use client';

import { memo } from 'react';

/**
 * Responsive animated background with gradient orbs and subtle patterns.
 * Render once at root level - shared across all screen sizes.
 */
export const AnimatedBackground = memo(function AnimatedBackground() {
	return (
		<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none">
			{/* Base gradient */}
			<div className="absolute inset-0 bg-linear-to-br from-background via-background to-muted/30" />

			{/* Animated orbs - responsive sizes */}
			<div className="absolute top-0 -left-20 md:-left-40 w-48 md:w-80 h-48 md:h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
			<div className="absolute bottom-0 -right-20 md:-right-40 w-56 md:w-96 h-56 md:h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />

			{/* Subtle grid - hidden on mobile for performance */}
			<div
				className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] hidden md:block"
				style={{
					backgroundImage:
						'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
					backgroundSize: '48px 48px',
				}}
			/>

			{/* Noise texture */}
			<div className="absolute inset-0 opacity-[0.02] bg-noise" />
		</div>
	);
});
