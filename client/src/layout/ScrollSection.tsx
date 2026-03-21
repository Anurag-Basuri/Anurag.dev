'use client';

import { useRef, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';

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

	return (
		<section
			id={`section-${id}`}
			className={`w-full min-h-full relative ${className}`}
			style={{ scrollSnapAlign: 'start' }}
		>
			<motion.div
				ref={ref}
				className="w-full"
				initial={{ opacity: 0, y: 40, scale: 0.96, filter: 'blur(10px)' }}
				animate={
					isInView
						? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }
						: { opacity: 0, y: 40, scale: 0.96, filter: 'blur(10px)' }
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
