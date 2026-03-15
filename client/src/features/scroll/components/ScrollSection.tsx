'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';

interface ScrollSectionProps {
	id: string;
	children: ReactNode;
	className?: string;
}

/**
 * Wraps a module in a scroll-snapping section with entrance animation.
 * Each section takes at least full viewport height and snaps to top.
 */
export function ScrollSection({ id, children, className = '' }: ScrollSectionProps) {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, amount: 0.15 });

	return (
		<section
			id={`section-${id}`}
			className={`min-h-dvh w-full relative ${className}`}
			style={{ scrollSnapAlign: 'start' }}
		>
			<motion.div
				ref={ref}
				className="h-full w-full"
				initial={{ opacity: 0, y: 40 }}
				animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
				transition={{
					duration: 0.6,
					ease: [0.25, 0.46, 0.45, 0.94],
				}}
			>
				{children}
			</motion.div>
		</section>
	);
}

