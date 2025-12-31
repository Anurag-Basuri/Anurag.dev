'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function PortfolioError({ error, reset }: ErrorProps) {
	useEffect(() => {
		console.error('Portfolio error:', error);
	}, [error]);

	return (
		<div className="h-full w-full flex items-center justify-center p-6">
			<div className="max-w-md w-full text-center">
				{/* Icon */}
				<div className="relative inline-block mb-6">
					<div className="absolute inset-0 bg-amber-500/20 blur-2xl rounded-full animate-pulse" />
					<div className="relative bg-amber-500/10 p-4 rounded-2xl border border-amber-500/20">
						<AlertTriangle className="w-10 h-10 text-amber-400" />
					</div>
				</div>

				{/* Content */}
				<h1 className="text-xl font-bold text-white mb-2">Module Error</h1>
				<p className="text-white/60 text-sm mb-2">
					{error.message || 'Something went wrong loading this module.'}
				</p>

				{error.digest && (
					<p className="text-[10px] text-white/30 font-mono mb-6">ID: {error.digest}</p>
				)}

				{/* Actions */}
				<div className="flex items-center justify-center gap-3">
					<button
						onClick={reset}
						className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors border border-emerald-500/30 text-sm font-medium"
					>
						<RefreshCw className="w-3.5 h-3.5" />
						Retry
					</button>
					<Link
						href="/portfolio"
						className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-colors border border-white/10 text-sm font-medium"
					>
						<Home className="w-3.5 h-3.5" />
						Home
					</Link>
				</div>
			</div>
		</div>
	);
}
