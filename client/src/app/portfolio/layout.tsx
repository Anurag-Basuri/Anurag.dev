'use client';

import { Suspense, type ReactNode } from 'react';
import { ErrorBoundary } from '@/ui/ErrorBoundary';
import { TopBar } from '@/layout/TopBar';
import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('@/layout/Sidebar').then(m => m.Sidebar), {
	ssr: false,
	loading: () => <div className="w-64 lg:w-72 shrink-0 animate-pulse bg-muted/10 rounded-xl" />,
});

export default function PortfolioLayout({ children }: { children: ReactNode }) {
	return (
		<div className="fixed inset-0 flex flex-col overflow-hidden bg-transparent font-sans text-foreground">
			<TopBar />

			<div className="flex-1 flex min-h-0 w-full overflow-hidden p-2 md:p-3 gap-2">
				{/* Sidebar */}
				<aside className="hidden md:flex rounded-xl bg-transparent border border-white/10 w-64 lg:w-72 shrink-0 overflow-hidden">
					<ErrorBoundary label="Sidebar">
						<Suspense
							fallback={<div className="h-full w-full animate-pulse bg-white/5" />}
						>
							<Sidebar />
						</Suspense>
					</ErrorBoundary>
				</aside>

				{/* Main content */}
				<main className="rounded-xl bg-transparent border border-white/10 flex-1 min-h-0 overflow-hidden relative">
					<ErrorBoundary label="Main Content">
						<Suspense
							fallback={<div className="h-full w-full animate-pulse bg-white/5" />}
						>
							{children}
						</Suspense>
					</ErrorBoundary>
				</main>
			</div>
		</div>
	);
}
