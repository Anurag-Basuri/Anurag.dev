'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { RefreshCw, AlertCircle, Bug } from 'lucide-react';

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		error: null,
		errorInfo: null,
	};

	public static getDerivedStateFromError(error: Error): Partial<State> {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.setState({ errorInfo });

		// Log to console in development
		if (process.env.NODE_ENV === 'development') {
			console.error('ErrorBoundary caught:', error);
			console.error('Component stack:', errorInfo.componentStack);
		}

		// Call optional error handler
		this.props.onError?.(error, errorInfo);
	}

	private handleReset = () => {
		this.setState({ hasError: false, error: null, errorInfo: null });
	};

	private handleReload = () => {
		window.location.reload();
	};

	public render() {
		if (this.state.hasError) {
			// Use custom fallback if provided
			if (this.props.fallback) {
				return this.props.fallback;
			}

			const { error } = this.state;
			const isDev = process.env.NODE_ENV === 'development';

			return (
				<div className="h-full w-full flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
					<div className="max-w-md w-full bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 text-center">
						{/* Icon */}
						<div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-red-500/10 text-red-400 mb-4 ring-1 ring-red-500/20">
							<AlertCircle className="w-7 h-7" />
						</div>

						{/* Content */}
						<h2 className="text-lg font-bold text-white mb-2">Something Went Wrong</h2>
						<p className="text-sm text-white/50 mb-4">
							This component encountered an error and couldn't render.
						</p>

						{/* Error details in dev */}
						{isDev && error && (
							<details className="text-left mb-4">
								<summary className="text-xs text-white/40 cursor-pointer hover:text-white/60 flex items-center gap-1.5 mb-2">
									<Bug className="w-3 h-3" />
									Debug Info
								</summary>
								<pre className="text-[10px] bg-red-500/10 border border-red-500/20 rounded-lg p-3 overflow-auto max-h-24 text-red-300 font-mono">
									{error.message}
									{'\n\n'}
									{error.stack?.split('\n').slice(0, 5).join('\n')}
								</pre>
							</details>
						)}

						{/* Actions */}
						<div className="flex items-center justify-center gap-2">
							<button
								onClick={this.handleReset}
								className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors border border-emerald-500/30 text-sm font-medium"
							>
								<RefreshCw className="w-3.5 h-3.5" />
								Try Again
							</button>
							<button
								onClick={this.handleReload}
								className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 text-white/70 hover:bg-white/10 transition-colors border border-white/10 text-sm font-medium"
							>
								Reload Page
							</button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

// Functional wrapper for easier use with hooks
export function withErrorBoundary<P extends object>(
	Component: React.ComponentType<P>,
	fallback?: ReactNode,
) {
	return function WrappedComponent(props: P) {
		return (
			<ErrorBoundary fallback={fallback}>
				<Component {...props} />
			</ErrorBoundary>
		);
	};
}
