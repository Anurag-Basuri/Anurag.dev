'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';
import { EASE } from '@/animations/motion';

interface ScrollSectionProps {
	id: string;
	children: ReactNode;
	className?: string;
}

/**
 * Wraps each module in a scroll-snapping section with a premium
 * blur + scale + fade entrance animation.
 */
export function ScrollSection({ id, children, className = '' }: ScrollSectionProps) {
	const ref = useRef<HTMLDivElement>(null);
	const isInView = useInView(ref, { once: true, amount: 0.08 });

	return (
		<section
			id={`section-${id}`}
			className={`w-full min-h-full relative ${className}`}
			style={{ scrollSnapAlign: 'start' }}
		>
			<motion.div
				ref={ref}
				className="w-full"
				initial={{ opacity: 0, y: 50, scale: 0.98, filter: 'blur(6px)' }}
				animate={
					isInView
						? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
						: { opacity: 0, y: 50, scale: 0.98, filter: 'blur(6px)' }
				}
				transition={{
					duration: 0.7,
					ease: EASE.smooth,
				}}
			>
				{children}
			</motion.div>
		</section>
	);
}
