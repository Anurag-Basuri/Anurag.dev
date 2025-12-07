'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Terminal } from 'lucide-react';

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
				<div className="h-screen w-full bg-[#0c0c0c] text-red-500 font-mono flex flex-col items-center justify-center p-4">
					<div className="max-w-2xl w-full border border-red-500/30 bg-red-500/5 rounded-lg p-6 shadow-2xl backdrop-blur-sm">
						<div className="flex items-center gap-3 border-b border-red-500/20 pb-4 mb-4">
							<AlertTriangle className="w-8 h-8 animate-pulse" />
							<h1 className="text-2xl font-bold tracking-wider">SYSTEM FAILURE</h1>
						</div>

						<div className="space-y-4">
							<div className="bg-black/50 p-4 rounded border border-red-500/10 font-mono text-sm overflow-auto max-h-[200px]">
								<p className="text-red-400 mb-2">
									$ cat /var/log/syslog | grep error
								</p>
								<p className="text-white/80">
									{this.state.error?.message ||
										'Unknown critical error occurred.'}
								</p>
								<p className="text-white/50 mt-2 italic">
									Stack trace logged to console.
								</p>
							</div>

							<div className="flex gap-4 pt-4">
								<button
									onClick={() => window.location.reload()}
									className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/50 rounded transition-colors text-red-400 hover:text-red-300"
								>
									<RefreshCw className="w-4 h-4" />
									System Reboot
								</button>
								<button
									onClick={() => this.setState({ hasError: false })}
									className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded transition-colors text-white/70 hover:text-white"
								>
									<Terminal className="w-4 h-4" />
									Attempt Recovery
								</button>
							</div>
						</div>
					</div>

					<div className="mt-8 text-xs text-white/20">ERROR_CODE: 0xCRASH_LANDING</div>
				</div>
			);
		}

		return this.props.children;
	}
}
