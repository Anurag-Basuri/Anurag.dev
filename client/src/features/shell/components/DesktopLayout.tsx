'use client';

import { Suspense, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Loader } from '@/components/common/Loader';
import dynamic from 'next/dynamic';

const CLI = dynamic(() => import('@/features/terminal/CLI').then(mod => mod.CLI), {
	ssr: false,
	loading: () => <Loader height="h-32" />,
});

const Sidebar = dynamic(() => import('@/features/sidebar/Sidebar').then(mod => mod.Sidebar), {
	ssr: false,
});

interface DesktopLayoutProps {
	children: ReactNode;
}

export function DesktopLayout({ children }: DesktopLayoutProps) {
	return (
		<div className="h-full w-full flex gap-1">
			{/* Sidebar */}
			<aside className="w-64 shrink-0 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
				<ErrorBoundary>
					<Suspense fallback={<Loader />}>
						<Sidebar />
					</Suspense>
				</ErrorBoundary>
			</aside>

			{/* Main content area */}
			<div className="flex-1 min-w-0 flex flex-col gap-1">
				{/* Content */}
				<main className="flex-1 min-h-0 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 overflow-auto">
					<ErrorBoundary>
						<Suspense fallback={<Loader />}>{children}</Suspense>
					</ErrorBoundary>
				</main>

				{/* Terminal */}
				<div className="h-64 shrink-0 rounded-lg bg-card/50 backdrop-blur-sm border border-border/50 overflow-hidden">
					<ErrorBoundary>
						<Suspense fallback={<Loader height="h-32" />}>
							<CLI />
						</Suspense>
					</ErrorBoundary>
				</div>
			</div>
		</div>
	);
}
