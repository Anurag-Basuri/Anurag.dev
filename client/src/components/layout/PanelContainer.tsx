'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PanelContainerProps {
	children: ReactNode;
	className?: string;
	isCollapsed?: boolean;
}

/**
 * Reusable panel container with smooth spring animations.
 * Handles collapse/expand transitions automatically.
 */
export function PanelContainer({ children, className, isCollapsed = false }: PanelContainerProps) {
	return (
		<motion.div
			layout
			initial={false}
			animate={{
				opacity: isCollapsed ? 0 : 1,
				scale: isCollapsed ? 0.96 : 1,
				filter: isCollapsed ? 'blur(2px)' : 'blur(0px)',
			}}
			transition={{
				layout: { type: 'spring', stiffness: 300, damping: 30 },
				opacity: { duration: 0.2 },
				scale: { duration: 0.2 },
				filter: { duration: 0.2 },
			}}
			className={cn('h-full', className)}
		>
			{children}
		</motion.div>
	);
}
