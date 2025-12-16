'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
	children: ReactNode;
}

interface State {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		error: null,
	};

	public static getDerivedStateFromError(error: Error): State {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('Uncaught error:', error, errorInfo);
	}

	public render() {
		if (this.state.hasError) {
			return (
				<div className="h-screen w-full bg-black flex items-center justify-center p-4 relative overflow-hidden">
					{/* Ambient Background */}
					<div className="absolute inset-0 pointer-events-none">
						<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[120px]" />
					</div>

					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						className="max-w-md w-full bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-8 flex flex-col items-center text-center relative z-10"
					>
						<div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 mb-6 ring-1 ring-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
							<AlertCircle className="w-8 h-8" />
						</div>

						<h2 className="text-2xl font-bold text-white mb-2 tracking-tight">
							System Malfunction
						</h2>

						<p className="text-sm text-white/50 mb-8 leading-relaxed">
							The application encountered a critical error processing your request.
							Diagnostic data has been logged.
						</p>

						<div className="flex gap-3 w-full">
							<button
								onClick={() => window.location.reload()}
								className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-white/90 hover:scale-[1.02] transition-all duration-200 active:scale-95"
							>
								<RefreshCw className="w-4 h-4" />
								Reboot System
							</button>
						</div>

						<div className="mt-6 font-mono text-[10px] text-white/20 uppercase tracking-widest">
							Error Code: 0xCRASH_HANDLER
						</div>
					</motion.div>
				</div>
			);
		}

		return this.props.children;
	}
}
