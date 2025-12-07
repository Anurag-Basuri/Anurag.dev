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
				<div className="h-screen w-full bg-background flex items-center justify-center p-4">
					<div className="max-w-md w-full bg-card border border-border rounded-xl shadow-2xl p-6 md:p-8 flex flex-col items-center text-center space-y-4">
						<div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-2">
							<AlertCircle className="w-6 h-6" />
						</div>

						<h2 className="text-xl font-bold text-foreground">Something went wrong</h2>

						<p className="text-sm text-muted-foreground">
							The application encountered an unexpected error. We apologize for the
							inconvenience.
						</p>

						<div className="flex gap-3 w-full pt-4">
							<button
								onClick={() => window.location.reload()}
								className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors"
							>
								<RefreshCw className="w-4 h-4" />
								Reload Application
							</button>
						</div>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}
