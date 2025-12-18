'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function AppError({ error, reset }: ErrorProps) {
	useEffect(() => {
		// Log error to error reporting service
		console.error('App route error:', error);
	}, [error]);

	return (
		<div className="h-full w-full flex items-center justify-center bg-transparent p-6">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
				className="text-center max-w-md"
			>
				{/* Icon */}
				<motion.div
					initial={{ scale: 0 }}
					animate={{ scale: 1 }}
					transition={{ delay: 0.2, type: 'spring', stiffness: 400, damping: 20 }}
					className="relative inline-block mb-6"
				>
					<div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full animate-pulse" />
					<div className="relative bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
						<AlertTriangle className="w-12 h-12 text-amber-400" />
					</div>
				</motion.div>

				{/* Title */}
				<h1 className="text-3xl font-bold text-white mb-2">Something Went Wrong</h1>
				<p className="text-muted-foreground mb-2">
					{error.message || 'An unexpected error occurred while loading this module.'}
				</p>
				{error.digest && (
					<p className="text-xs text-white/30 font-mono mb-8">Error ID: {error.digest}</p>
				)}

				{/* Actions */}
				<div className="flex items-center justify-center gap-4 mt-8">
					<button
						onClick={reset}
						className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors border border-primary/30"
					>
						<RefreshCw className="w-4 h-4" />
						<span>Try Again</span>
					</button>
					<Link
						href="/app"
						className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-colors border border-white/10"
					>
						<Home className="w-4 h-4" />
						<span>Go Home</span>
					</Link>
				</div>
			</motion.div>
		</div>
	);
}
