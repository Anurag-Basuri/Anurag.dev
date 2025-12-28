'use client';

import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

type HelpButtonProps = {
	onClick?: () => void;
	className?: string;
};

export function HelpButton({ onClick, className }: HelpButtonProps) {
	return (
		<motion.button
			initial={{ scale: 0, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			transition={{ delay: 1, type: 'spring' }}
			onClick={onClick}
			className={cn(
				'fixed bottom-6 right-6 z-40',
				'w-11 h-11 sm:w-12 sm:h-12',
				'bg-linear-to-br from-emerald-500 to-emerald-600',
				'text-white rounded-full',
				'shadow-lg shadow-emerald-500/25',
				'hover:shadow-xl hover:shadow-emerald-500/30',
				'hover:scale-105 active:scale-95',
				'transition-all duration-200',
				'flex items-center justify-center',
				'focus:outline-none focus:ring-2 focus:ring-emerald-400/40',
				className,
			)}
			aria-label="Help"
		>
			<HelpCircle className="w-5 h-5" />
		</motion.button>
	);
}
