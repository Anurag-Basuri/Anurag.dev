'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface TemplateProps {
	children: ReactNode;
}

export default function Template({ children }: TemplateProps) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
			animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
			transition={{
				duration: 0.3,
				ease: [0.22, 1, 0.36, 1],
			}}
			className="h-full w-full"
		>
			{children}
		</motion.div>
	);
}
