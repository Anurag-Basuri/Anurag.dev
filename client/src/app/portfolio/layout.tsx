'use client';

import { Suspense, type ReactNode, useCallback } from 'react';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Toaster } from 'react-hot-toast';
import { ContextMenuProvider } from '@/components/providers/context-menu-provider';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useSetAtom } from 'jotai';
import { openFilesAtom, createFileEntry } from '@/store/atoms/files';
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

const Taskbar = dynamic(() => import('@/features/shell/components/Taskbar').then(m => m.Taskbar), {
	ssr: false,
	loading: () => <div className="h-8 bg-background" />,
});

export default function PortfolioLayout({ children }: { children: ReactNode }) {
	const isMobile = useMediaQuery('(max-width: 768px)');
	const router = useRouter();
	const setOpenFiles = useSetAtom(openFilesAtom);

	// Handle file selection: add to open files (no duplicates) and navigate
	const handleFileSelect = useCallback(
		(item: { moduleId?: string }) => {
			if (!item.moduleId) return;

			// Add to open files if not already present
			setOpenFiles(prev => {
				const exists = prev.some(f => f.moduleId === item.moduleId);
				if (exists) return prev; // No duplicate
				return [...prev, createFileEntry(item.moduleId!)];
			});

			// Navigate to the module
			router.push(`/portfolio/${item.moduleId}`);
		},
		[router, setOpenFiles],
	);

	return (
		<ErrorBoundary>
			<AnimatedBackground />

			<ContextMenuProvider>
				<div className="fixed inset-0 flex flex-col overflow-hidden bg-transparent font-sans">
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

					<Suspense fallback={<div className="h-8" />}>
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
