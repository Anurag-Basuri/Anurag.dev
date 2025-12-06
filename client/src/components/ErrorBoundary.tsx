'use client';

import React from 'react';

interface ErrorBoundaryProps {
	children: React.ReactNode;
	fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { hasError: false, error: null };
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		console.error('ErrorBoundary caught an error:', error, errorInfo);
	}

	render() {
		if (this.state.hasError) {
			if (this.props.fallback) {
				return this.props.fallback;
			}

			return (
				<div className="min-h-screen flex items-center justify-center bg-background p-4">
					<div className="max-w-md w-full space-y-4 text-center">
						<div className="text-6xl">⚠️</div>
						<h1 className="text-2xl font-bold text-foreground">
							Oops! Something went wrong
						</h1>
						<p className="text-muted-foreground">
							Don't worry, this happens sometimes. Try refreshing the page.
						</p>
						<div className="flex gap-3 justify-center">
							<button
								onClick={() => window.location.reload()}
								className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
							>
								Refresh Page
							</button>
							<button
								onClick={() => this.setState({ hasError: false, error: null })}
								className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
							>
								Try Again
							</button>
						</div>
						{process.env.NODE_ENV === 'development' && this.state.error && (
							<details className="mt-4 text-left">
								<summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
									Error Details
								</summary>
								<pre className="mt-2 p-4 bg-muted rounded text-xs overflow-auto">
									{this.state.error.toString()}
								</pre>
							</details>
						)}
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
