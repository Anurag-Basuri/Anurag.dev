'use client';

import { Suspense, type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Loader } from '@/components/common/Loader';
import dynamic from 'next/dynamic';


const Sidebar = dynamic(() => import('@/features/sidebar/components/Sidebar').then(m => m.Sidebar), {
	ssr: false,
	loading: () => <Loader />,
});

// Simple panel styling (transparent surface)
const panel = 'rounded-xl bg-transparent border border-border/20';

export function DesktopLayout({ children }: { children: ReactNode }) {
	return (
		<div className="h-full w-full flex gap-2">
			{/* Sidebar */}
			<aside className={`${panel} w-64 lg:w-72 shrink-0 overflow-hidden`}>
				<ErrorBoundary>
					<Suspense fallback={<Loader />}>
						<Sidebar />
					</Suspense>
				</ErrorBoundary>
			</aside>

		{/* Main */}
			<div className="flex-1 min-w-0 flex flex-col gap-2">
				<main className={`${panel} flex-1 min-h-0 overflow-hidden`}>
					<ErrorBoundary>
						<Suspense fallback={<Loader />}>{children}</Suspense>
					</ErrorBoundary>
				</main>
			</div>
		</div>
	);
}
