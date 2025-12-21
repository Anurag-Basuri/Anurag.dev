'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, ArrowLeft, AlertCircle } from 'lucide-react';

export default function AppNotFound() {
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
					<div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full" />
					<div className="relative bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
						<AlertCircle className="w-12 h-12 text-red-400" />
					</div>
				</motion.div>

				{/* Title */}
				<h1 className="text-3xl font-bold text-white mb-2">Module Not Found</h1>
				<p className="text-muted-foreground mb-8">
					The requested module doesn&apos;t exist or has been moved.
				</p>

				{/* Actions */}
				<div className="flex items-center justify-center gap-4">
					<Link
						href="/portfolio"
						className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors border border-primary/30"
					>
						<Home className="w-4 h-4" />
						<span>Go Home</span>
					</Link>
					<button
						onClick={() => window.history.back()}
						className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-colors border border-white/10"
					>
						<ArrowLeft className="w-4 h-4" />
						<span>Go Back</span>
					</button>
				</div>
			</motion.div>
		</div>
	);
}
