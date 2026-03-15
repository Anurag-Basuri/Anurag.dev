'use client';

import { Suspense, type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Toaster } from 'react-hot-toast';
import { ContextMenuProvider } from '@/components/providers/context-menu-provider';
import dynamic from 'next/dynamic';
import { DesktopLayout } from '@/features/shell/components/DesktopLayout';
import { MobileLayout } from '@/features/shell/components/MobileLayout';

const AnimatedBackground = dynamic(
	() => import('@/features/shell/components/AnimatedBackground').then(m => m.AnimatedBackground),
	{ ssr: false },
);

const TopBar = dynamic(() => import('@/features/shell/components/TopBar').then(m => m.TopBar), {
	ssr: false,
	loading: () => <div className="h-8 bg-background" />,
});

export default function PortfolioLayout({ children }: { children: ReactNode }) {
	const isMobile = useMediaQuery('(max-width: 768px)');

	return (
		<ErrorBoundary>
			<AnimatedBackground />

			<ContextMenuProvider>
				<div className="fixed inset-0 flex flex-col overflow-hidden bg-transparent font-sans">
					<Suspense fallback={<div className="h-8" />}>
						<TopBar isMobile={isMobile} />
					</Suspense>

					<div className="flex-1 min-h-0 w-full overflow-hidden p-2 md:p-3">
						{isMobile ? (
							<MobileLayout>{children}</MobileLayout>
						) : (
							<DesktopLayout>{children}</DesktopLayout>
						)}
					</div>

					<Toaster
						position="top-right"
						toastOptions={{
							duration: 3000,
							style: {
								background: 'var(--background)',
								color: 'var(--foreground)',
								border: '1px solid var(--border)',
							},
						}}
					/>
				</div>
			</ContextMenuProvider>
		</ErrorBoundary>
	);
}
