'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { getSectionTheme } from '@/lib/theme';

interface ScrollSectionProps {
	id: string;
	children: ReactNode;
	className?: string;
}

/**
 * Wraps each module in a scroll-snapping section with a premium
 * staggered 3D blur + scale + fade entrance animation.
 */
export function ScrollSection({ id, children, className = '' }: ScrollSectionProps) {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, amount: 0.08 });
	const theme = getSectionTheme(id);

	return (
		<section
			id={`section-${id}`}
			className={`w-full relative ${className}`}
			style={{ 
				'--theme-primary': theme.hex,
				'--primary': theme.hex,
			} as React.CSSProperties}
		>
			{/* Ambient, extremely subtle, moving background glow inherently tracking the section's unique hex color */}
			<div 
				className="absolute inset-0 pointer-events-none -z-10 opacity-20 sm:opacity-30 mix-blend-screen transition-colors duration-1000"
				style={{ 
					background: `radial-gradient(circle at 50% 0%, color-mix(in oklch, var(--theme-primary) 12%, transparent) 0%, transparent 60%)`
				}}
			/>
			
			<motion.div
				ref={ref}
				className="w-full relative z-10"
				initial={{ opacity: 0, y: 20, scale: 0.98 }}
				animate={
					isInView
						? { opacity: 1, y: 0, scale: 1 }
						: { opacity: 0, y: 20, scale: 0.98 }
				}
				transition={{
					duration: 0.8,
					ease: [0.16, 1, 0.3, 1],
				}}
			>
				{children}
			</motion.div>
		</section>
	);
}
