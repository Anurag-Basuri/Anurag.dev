'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home, Bug, ChevronDown, ChevronUp } from 'lucide-react';

interface ErrorProps {
	error: Error & { digest?: string };
	reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
	const [showStack, setShowStack] = useState(false);
	const [recovering, setRecovering] = useState(false);
	const [dots, setDots] = useState('');

	useEffect(() => {
		console.error('Global error:', error);
	}, [error]);

	// Animated dots for recovery
	useEffect(() => {
		if (!recovering) return;
		const interval = setInterval(() => {
			setDots(d => (d.length >= 3 ? '' : d + '.'));
		}, 400);
		return () => clearInterval(interval);
	}, [recovering]);

	const handleReset = () => {
		setRecovering(true);
		setTimeout(() => {
			reset();
		}, 1500);
	};

	return (
		<div className="min-h-screen bg-[#020202] flex items-center justify-center p-6 font-mono relative overflow-hidden">
			{/* Scan lines effect */}
			<div
				className="absolute inset-0 pointer-events-none opacity-[0.02]"
				style={{
					background:
						'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(16, 185, 129, 0.03) 2px, rgba(16, 185, 129, 0.03) 4px)',
				}}
			/>

			{/* Content */}
			<div className="max-w-lg w-full relative z-10">
				{/* Error Card */}
				<div className="bg-black/60 backdrop-blur-xl border border-red-500/30 rounded-lg overflow-hidden shadow-[0_0_50px_-10px_rgba(239,68,68,0.3)]">
					{/* Header */}
					<div className="flex items-center gap-3 px-4 py-3 bg-red-900/20 border-b border-red-500/20">
						<AlertTriangle className="w-5 h-5 text-red-400 animate-pulse" />
						<span className="text-red-400 text-sm font-bold tracking-wider">
							SYSTEM_EXCEPTION
						</span>
						{error.digest && (
							<span className="ml-auto text-red-500/50 text-xs font-mono">
								#{error.digest}
							</span>
						)}
					</div>

					{/* Body */}
					<div className="p-6 space-y-5">
						{/* Error Icon */}
						<div className="flex justify-center">
							<div className="relative">
								<div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full animate-pulse" />
								<div className="relative bg-red-500/10 p-5 rounded-2xl border border-red-500/20">
									<Bug className="w-10 h-10 text-red-400" />
								</div>
							</div>
						</div>

						{/* Message */}
						<div className="text-center">
							<h1 className="text-xl font-bold text-white/90 mb-2">
								{recovering ? `Attempting Recovery${dots}` : 'Process Terminated'}
							</h1>
							<p className="text-white/50 text-sm">
								{recovering
									? 'Please wait while system recovers...'
									: 'An unexpected exception has occurred.'}
							</p>
						</div>

						{/* Error Details */}
						{process.env.NODE_ENV === 'development' && error.message && (
							<div className="space-y-2">
								<button
									onClick={() => setShowStack(!showStack)}
									className="flex items-center gap-2 text-xs text-red-400/70 hover:text-red-400 transition-colors w-full"
								>
									{showStack ? (
										<ChevronUp className="w-3 h-3" />
									) : (
										<ChevronDown className="w-3 h-3" />
									)}
									<span>Stack Trace</span>
								</button>
								{showStack && (
									<pre className="text-[10px] bg-red-500/10 border border-red-500/20 rounded-lg p-3 overflow-auto max-h-32 text-red-300/80 animate-in fade-in duration-300">
										{error.stack || error.message}
									</pre>
								)}
							</div>
						)}

						{/* Recovery Progress */}
						{recovering && (
							<div className="space-y-2">
								<div className="h-1 w-full bg-red-950/50 rounded-full overflow-hidden">
									<div
										className="h-full bg-linear-to-r from-red-500 to-amber-500 animate-pulse"
										style={{ width: '60%' }}
									/>
								</div>
								<p className="text-center text-xs text-amber-500/60">
									Restoring system state...
								</p>
							</div>
						)}

						{/* Actions */}
						{!recovering && (
							<div className="flex flex-wrap items-center justify-center gap-3 pt-2">
								<button
									onClick={handleReset}
									className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all duration-300 border border-emerald-500/30 font-medium text-sm hover:scale-105"
								>
									<RefreshCw className="w-4 h-4" />
									Retry Process
								</button>
								<Link
									href="/portfolio"
									className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-all duration-300 border border-white/10 font-medium text-sm hover:scale-105"
								>
									<Home className="w-4 h-4" />
									Safe Mode
								</Link>
							</div>
						)}
					</div>
				</div>

				{/* System Info */}
				<div className="flex justify-center gap-4 mt-6 text-[10px] text-white/20 font-mono">
					<span>KERNEL v3.14.159</span>
					<span>•</span>
					<span>MEM: 42.0% FREE</span>
					<span>•</span>
					<span>UPTIME: ∞</span>
				</div>
			</div>
		</div>
	);
}
