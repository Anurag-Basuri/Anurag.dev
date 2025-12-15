'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
	size?: 'sm' | 'md' | 'lg';
	className?: string;
	text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
	const sizeClasses = {
		sm: 'w-4 h-4',
		md: 'w-8 h-8',
		lg: 'w-12 h-12',
	};

	return (
		<div className={cn('flex flex-col items-center justify-center gap-3', className)}>
			<motion.div
				animate={{ rotate: 360 }}
				transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
				className="relative"
			>
				<Loader2 className={cn(sizeClasses[size], 'text-emerald-400')} />
				<motion.div
					className="absolute inset-0 rounded-full bg-emerald-400/20 blur-xl"
					animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
					transition={{ duration: 2, repeat: Infinity }}
				/>
			</motion.div>
			{text && (
				<motion.p
					initial={{ opacity: 0, y: 5 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-sm text-muted-foreground font-medium"
				>
					{text}
				</motion.p>
			)}
		</div>
	);
}
