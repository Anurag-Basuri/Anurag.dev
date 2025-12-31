'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
	useEffect(() => {
		// Log to error reporting service in production
		console.error('Global error:', error);
	}, [error]);

	return (
		<div className="min-h-screen bg-black flex items-center justify-center p-6">
			<div className="max-w-md w-full text-center">
				{/* Icon */}
				<div className="relative inline-block mb-6">
					<div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full animate-pulse" />
					<div className="relative bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
						<AlertTriangle className="w-12 h-12 text-amber-400" />
					</div>
				</div>

				{/* Content */}
				<h1 className="text-2xl font-bold text-white mb-2">Something Went Wrong</h1>
				<p className="text-white/60 mb-2">
					An unexpected error occurred. Please try again.
				</p>

				{error.digest && (
					<p className="text-xs text-white/30 font-mono mb-6">Error ID: {error.digest}</p>
				)}

				{/* Debug info in development */}
				{process.env.NODE_ENV === 'development' && error.message && (
					<pre className="text-left text-xs bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 overflow-auto max-h-32 text-red-300">
						{error.message}
					</pre>
				)}

				{/* Actions */}
				<div className="flex items-center justify-center gap-3">
					<button
						onClick={reset}
						className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors border border-emerald-500/30 font-medium"
					>
						<RefreshCw className="w-4 h-4" />
						Try Again
					</button>
					<Link
						href="/portfolio"
						className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-colors border border-white/10 font-medium"
					>
						<Home className="w-4 h-4" />
						Go Home
					</Link>
				</div>
			</div>
		</div>
	);
}
