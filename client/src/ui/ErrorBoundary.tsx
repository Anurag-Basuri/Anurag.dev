'use client';

// ErrorBoundary component to catch and report errors in the React component tree.
// Provides a fallback UI and retry mechanism. Errors are reported to an external service.
// Usage:
// <ErrorBoundary>
//   <MyComponent />
// </ErrorBoundary>

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, AlertTriangle, Bug } from 'lucide-react';

// ErrorReporter is a simple in-memory error logger that can be extended to send errors to an external service.
export interface CaptureOptions {
	label?: string;
	componentStack?: string;
	extra?: Record<string, unknown>;
}

interface ErrorEntry {
	error: Error;
	options: CaptureOptions;
	timestamp: number;
}

class ErrorReporterSingleton {
	private entries: ErrorEntry[] = [];
	private maxEntries = 50;

	capture(error: Error, options: CaptureOptions = {}) {
		const entry: ErrorEntry = {
			error,
			options,
			timestamp: Date.now(),
		};

		this.entries = [entry, ...this.entries].slice(0, this.maxEntries);

		if (process.env.NODE_ENV === 'development') {
			console.group(`[ErrorReporter] ${options.label ?? 'Uncaught Error'}`);
			console.error(error);
			if (options.componentStack) {
				console.error('Component Stack:', options.componentStack);
			}
			console.groupEnd();
		}

		// TODO: Send to analytics/Sentry in production
		// if (process.env.NODE_ENV === 'production') { sendToSentry(entry); }
	}

	captureAsync(error: unknown, label?: string) {
		const err = error instanceof Error ? error : new Error(String(error));
		this.capture(err, { label });
	}

	getEntries(): readonly ErrorEntry[] {
		return this.entries;
	}

	clear() {
		this.entries = [];
	}
}

export const ErrorReporter = new ErrorReporterSingleton();

interface Props {
	children: ReactNode;
	fallback?: ReactNode;
	onError?: (error: Error, info: ErrorInfo) => void;
	maxRetries?: number;
	label?: string; // optional label for reporting context
}

interface State {
	hasError: boolean;
	error: Error | null;
	errorInfo: ErrorInfo | null;
	retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
	public state: State = {
		hasError: false,
		error: null,
		errorInfo: null,
		retryCount: 0,
	};

	public static getDerivedStateFromError(error: Error): Partial<State> {
		return { hasError: true, error };
	}

	public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		this.setState({ errorInfo });
		ErrorReporter.capture(error, {
			label: this.props.label,
			componentStack: errorInfo.componentStack ?? undefined,
		});
		this.props.onError?.(error, errorInfo);
	}

	private reset = () => {
		const max = this.props.maxRetries ?? 3;
		if (this.state.retryCount >= max) {
			window.location.reload();
			return;
		}
		this.setState(prev => ({
			hasError: false,
			error: null,
			errorInfo: null,
			retryCount: prev.retryCount + 1,
		}));
	};

	public render() {
		if (!this.state.hasError) return this.props.children;
		if (this.props.fallback) return this.props.fallback;

		const { error, retryCount } = this.state;
		const isDev = process.env.NODE_ENV === 'development';
		const maxRetries = this.props.maxRetries ?? 3;

		return (
			<div className="flex h-full w-full items-center justify-center p-6">
				<div className="w-full max-w-sm rounded-2xl border border-border bg-background/80 p-6 text-center shadow-2xl backdrop-blur-xl">
					{/* Icon */}
					<div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-rose-500/10 ring-1 ring-rose-500/20">
						<AlertTriangle className="h-7 w-7 text-rose-400" />
					</div>

					<h2 className="mb-1 text-base font-bold text-foreground">Something went wrong</h2>
					{this.props.label && (
						<p className="mb-1 text-xs font-mono text-muted-foreground">{this.props.label}</p>
					)}
					<p className="mb-4 text-sm text-muted-foreground">
						This section encountered an error and couldn't render.
					</p>

					{retryCount > 0 && retryCount < maxRetries && (
						<p className="mb-3 text-xs text-amber-400/70">
							Retry {retryCount} / {maxRetries}
						</p>
					)}

					{/* Dev debug details */}
					{isDev && error && (
						<details className="mb-4 text-left">
							<summary className="mb-2 flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground hover:text-muted-foreground">
								<Bug className="h-3 w-3" />
								Debug
							</summary>
							<pre className="max-h-28 overflow-auto rounded-lg border border-rose-500/20 bg-rose-500/10 p-3 font-mono text-[10px] text-rose-300">
								{error.message}
								{'\n\n'}
								{error.stack?.split('\n').slice(0, 5).join('\n')}
							</pre>
						</details>
					)}

					{/* Actions */}
					<div className="flex justify-center gap-2">
						<button
							onClick={this.reset}
							className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-3 py-2 text-sm font-medium text-emerald-400 transition-colors hover:bg-emerald-500/30"
						>
							<RefreshCw className="h-3.5 w-3.5" />
							{retryCount >= maxRetries ? 'Reload' : 'Try Again'}
						</button>
					</div>
				</div>
			</div>
		);
	}
}

// HOC wrapper
export function withErrorBoundary<P extends object>(
	Component: React.ComponentType<P>,
	label?: string,
) {
	return function WrappedComponent(props: P) {
		return (
			<ErrorBoundary label={label}>
				<Component {...props} />
			</ErrorBoundary>
		);
	};
}
