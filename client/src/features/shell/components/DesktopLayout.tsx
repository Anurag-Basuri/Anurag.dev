'use client';

import { Suspense, type ReactNode, memo } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Loader } from '@/components/common/Loader';
import dynamic from 'next/dynamic';

const CLI = dynamic(() => import('@/features/terminal/CLI').then(m => m.CLI), {
	ssr: false,
	loading: () => <Loader height="h-full" />,
});

const Sidebar = dynamic(() => import('@/features/sidebar/Sidebar').then(m => m.Sidebar), {
	ssr: false,
	loading: () => <Loader />,
});

// Shared panel styles for consistency
const panelStyles = {
	base: 'rounded-xl bg-card/60 backdrop-blur-md border border-border/40 shadow-lg transition-shadow duration-300 hover:shadow-xl',
	sidebar: 'w-72 shrink-0 overflow-hidden',
	main: 'flex-1 min-h-0 overflow-auto',
	terminal: 'h-72 shrink-0 overflow-hidden',
};

// Animated background component
const AnimatedBackground = memo(function AnimatedBackground() {
	return (
		<div className="fixed inset-0 -z-10 overflow-hidden">
			{/* Base gradient */}
			<div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/20" />

			{/* Animated gradient orbs */}
			<div className="absolute top-0 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
			<div className="absolute bottom-0 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000" />
			<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-primary/5 to-transparent rounded-full blur-3xl" />

			{/* Subtle grid pattern */}
			<div
				className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
				style={{
					backgroundImage: `
						linear-gradient(rgba(var(--primary-rgb, 0, 0, 0), 0.1) 1px, transparent 1px),
						linear-gradient(90deg, rgba(var(--primary-rgb, 0, 0, 0), 0.1) 1px, transparent 1px)
					`,
					backgroundSize: '64px 64px',
				}}
			/>

			{/* Noise texture overlay */}
			<div className="absolute inset-0 opacity-[0.02] bg-noise" />
		</div>
	);
});

export function DesktopLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<AnimatedBackground />

			<div className="h-full w-full flex gap-2 p-0.5">
				{/* Sidebar Panel */}
				<aside className={`${panelStyles.base} ${panelStyles.sidebar}`}>
					<ErrorBoundary>
						<Suspense fallback={<Loader />}>
							<Sidebar />
						</Suspense>
					</ErrorBoundary>
				</aside>

				{/* Main Content Area */}
				<div className="flex-1 min-w-0 flex flex-col gap-2">
					{/* Content Panel */}
					<main className={`${panelStyles.base} ${panelStyles.main}`}>
						<ErrorBoundary>
							<Suspense fallback={<Loader />}>{children}</Suspense>
						</ErrorBoundary>
					</main>

					{/* Terminal Panel */}
					<section className={`${panelStyles.base} ${panelStyles.terminal}`}>
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
