import React from 'react';
import { AlertTriangle, RefreshCw, WifiOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ModuleErrorProps {
	message?: string;
	onRetry?: () => void;
	className?: string;
}

export function ModuleError({ message, onRetry, className }: ModuleErrorProps) {
	return (
		<div
			className={cn(
				'h-full flex flex-col items-center justify-center p-6 text-center',
				className,
			)}
		>
			<motion.div
				initial={{ scale: 0.8, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				transition={{ duration: 0.3 }}
				className="space-y-4 max-w-md"
			>
				<div className="relative w-16 h-16 mx-auto">
					<div className="absolute inset-0 bg-destructive/20 rounded-full animate-ping" />
					<div className="relative bg-background border-2 border-destructive/50 rounded-full p-3 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.2)]">
						<WifiOff className="w-8 h-8 text-destructive" />
					</div>
				</div>

				<div className="space-y-2">
					<h3 className="text-xl font-bold text-foreground">Connection Failed</h3>
					<p className="text-muted-foreground text-sm">
						{message || 'Unable to load module data. Please check your connection.'}
					</p>
				</div>

				{onRetry && (
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						onClick={onRetry}
						className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-md text-sm font-medium transition-colors border border-primary/20"
					>
						<RefreshCw className="w-4 h-4" />
						Try Again
					</motion.button>
				)}
			</motion.div>
		</div>
	);
}
