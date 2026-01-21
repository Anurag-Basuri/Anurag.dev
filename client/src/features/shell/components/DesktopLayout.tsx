'use client';

import { Suspense, type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Loader } from '@/components/common/Loader';
import { AnimatedBackground } from './AnimatedBackground';
import dynamic from 'next/dynamic';

const CLI = dynamic(() => import('@/features/terminal/CLI').then(m => m.CLI), {
	ssr: false,
	loading: () => <Loader height="h-full" message="Initializing Terminal..." showMessage />,
});

const Sidebar = dynamic(() => import('@/features/sidebar/Sidebar').then(m => m.Sidebar), {
	ssr: false,
	loading: () => <Loader message="Loading System..." showMessage />,
});

// Enhanced glassmorphism panel styles
const panelStyles = {
	base: 'rounded-xl bg-card/40 backdrop-blur-md border border-white/10 dark:border-white/5 shadow-lg transition-all duration-500',
	hover: 'hover:shadow-xl hover:bg-card/50 hover:border-white/20 dark:hover:border-white/10',
	sidebar: 'w-72 shrink-0 overflow-hidden flex flex-col',
	main: 'flex-1 min-h-0 overflow-hidden flex flex-col',
	terminal: 'h-72 shrink-0 overflow-hidden flex flex-col',
};

export function DesktopLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<AnimatedBackground />

			<div className="h-full w-full flex gap-3 p-3 lg:p-4 transition-all duration-300 ease-out">
				{/* Sidebar Panel */}
				<aside
					className={`${panelStyles.base} ${panelStyles.sidebar} ${panelStyles.hover}`}
				>
					<ErrorBoundary>
						<Suspense fallback={<Loader />}>
							<Sidebar />
						</Suspense>
					</ErrorBoundary>
				</aside>

				{/* Main Content Column */}
				<div className="flex-1 min-w-0 flex flex-col gap-3">
					{/* Content Panel */}
					<main
						className={`${panelStyles.base} ${panelStyles.main} ${panelStyles.hover}`}
					>
						<ErrorBoundary>
							<Suspense fallback={<Loader />}>{children}</Suspense>
						</ErrorBoundary>
					</main>

					{/* Terminal Panel */}
					<section
						className={`${panelStyles.base} ${panelStyles.terminal} ${panelStyles.hover}`}
					>
						<ErrorBoundary>
							<Suspense fallback={<Loader height="h-full" />}>
								<CLI />
							</Suspense>
						</ErrorBoundary>
					</section>
				</div>
			</div>
		</>
	);
}
