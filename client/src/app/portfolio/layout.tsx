'use client';

import { Suspense, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { Loader } from '@/components/common/Loader';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Toaster } from 'react-hot-toast';
import { ContextMenuProvider } from '@/components/providers/context-menu-provider';
import dynamic from 'next/dynamic';
import { useRouter, usePathname } from 'next/navigation';
import { AnimatedBackground } from '@/features/shell/components/AnimatedBackground';
import { DesktopLayout } from '@/features/shell/components/DesktopLayout';
import { MobileLayout } from '@/features/shell/components/MobileLayout';

const TopBar = dynamic(() => import('@/features/shell/components/TopBar').then(m => m.TopBar), {
	ssr: false,
	loading: () => <div className="h-8 bg-background" />,
});

const Taskbar = dynamic(() => import('@/features/shell/components/Taskbar').then(m => m.Taskbar), {
	ssr: false,
	loading: () => <div className="h-10 bg-background" />,
});

export default function PortfolioLayout({ children }: { children: ReactNode }) {
	const isMobile = useMediaQuery('(max-width: 768px)');
	const router = useRouter();
	const pathname = usePathname();

	const handleFileSelect = (item: { moduleId?: string }) => {
		if (item.moduleId) {
			router.push(`/portfolio/${item.moduleId}`);
		}
	};

	return (
		<ErrorBoundary>
			{/* Single background for all screen sizes */}
			<AnimatedBackground />

			<ContextMenuProvider>
				<div className="fixed inset-0 flex flex-col overflow-hidden bg-background/80 font-sans">
					<Suspense fallback={<div className="h-8" />}>
						<TopBar isMobile={isMobile} onFileSelect={handleFileSelect} />
					</Suspense>

					<div className="flex-1 min-h-0 w-full overflow-hidden p-2 md:p-3">
						{isMobile ? (
							<MobileLayout>{children}</MobileLayout>
						) : (
							<DesktopLayout>{children}</DesktopLayout>
						)}
					</div>

					<Suspense fallback={<div className="h-10" />}>
						<Taskbar isMobile={isMobile} />
					</Suspense>

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
