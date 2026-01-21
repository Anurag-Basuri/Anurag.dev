'use client';

import { memo } from 'react';

export const AnimatedBackground = memo(function AnimatedBackground() {
	return (
		<div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
			{/* Base gradient - Warm, paper-like foundation */}
			<div className="absolute inset-0 bg-linear-to-br from-background via-background to-muted/20" />

			{/* Animated gradient orbs with enhanced blending */}
			<div className="absolute top-0 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse mix-blend-multiply dark:mix-blend-screen" />
			<div className="absolute bottom-0 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000 mix-blend-multiply dark:mix-blend-screen" />

			{/* Central focal point */}
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl opacity-50" />

			{/* Subtle grid pattern for structure */}
			<div
				className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
				style={{
					backgroundImage: `
						linear-gradient(rgba(var(--primary-rgb, 0, 0, 0), 0.1) 1px, transparent 1px),
						linear-gradient(90deg, rgba(var(--primary-rgb, 0, 0, 0), 0.1) 1px, transparent 1px)
					`,
					backgroundSize: '64px 64px',
				}}
			/>

			{/* Noise texture for organic feel */}
			<div className="absolute inset-0 opacity-[0.025] bg-noise mix-blend-overlay" />

			{/* Vignette for focus */}
			<div className="absolute inset-0 bg-radial-gradient from-transparent to-background/20" />
		</div>
	);
});
