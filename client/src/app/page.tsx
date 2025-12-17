'use client';

import { BootAnimation } from '@/components/layout/BootAnimation';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '@/store';
import { useEffect, useState, memo, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';

// Session storage key constant
const BOOT_SESSION_KEY = 'anuragos-boot-complete';

// Loading fallback component
const LoadingFallback = memo(function LoadingFallback() {
	return (
		<div className="fixed inset-0 bg-black flex items-center justify-center">
			<div className="flex flex-col items-center gap-4">
				<div
					className="w-12 h-12 border-4 border-[#00ff41]/20 border-t-[#00ff41] rounded-full animate-spin"
					role="status"
					aria-label="Loading system"
				/>
				<div className="text-[#00ff41] text-sm font-mono animate-pulse">
					LOADING SYSTEM...
				</div>
			</div>
		</div>
	);
});

// Lazy load MainLayout with optimizations
const MainLayout = dynamic(
	() => import('@/components/layout/MainLayout').then(mod => mod.MainLayout),
	{
		ssr: false,
		loading: () => <LoadingFallback />,
	},
);

function Home() {
	const [bootComplete, setBootComplete] = useAtom(bootCompleteAtom);
	const [isHydrated, setIsHydrated] = useState(false);
	const [shouldPreload, setShouldPreload] = useState(false);

	// Initialize boot state on mount
	useEffect(() => {
		let mounted = true;

		const initialize = async () => {
			try {
				// Clear session storage to force boot animation on page refresh
				sessionStorage.removeItem(BOOT_SESSION_KEY);

				// Reset boot complete state
				if (mounted) {
					setBootComplete(false);
					setIsHydrated(true);
				}
			} catch (error) {
				// Handle sessionStorage not available (private browsing, etc.)
				console.warn('SessionStorage not available:', error);
				if (mounted) {
					setIsHydrated(true);
				}
			}
		};

		initialize();

		return () => {
			mounted = false;
		};
	}, [setBootComplete]);

	// Preload MainLayout after boot animation starts (50% through first phase)
	useEffect(() => {
		if (!isHydrated) return;

		const preloadTimer = setTimeout(() => {
			setShouldPreload(true);
			// Preload the module
			import('@/components/layout/MainLayout');
		}, 625); // 625ms = 50% of first phase (1.25s)

		return () => clearTimeout(preloadTimer);
	}, [isHydrated]);

	// Prevent flash of content during hydration
	if (!isHydrated) {
		return <LoadingFallback />;
	}

	return (
		<>
			<AnimatePresence mode="wait">
				{!bootComplete && <BootAnimation key="boot" />}
			</AnimatePresence>
			{/* Only render MainLayout after boot completes or start preloading */}
			{(bootComplete || shouldPreload) && (
				<Suspense fallback={<LoadingFallback />}>
					{bootComplete && <MainLayout key="main" />}
				</Suspense>
			)}
		</>
	);
}

// Export memoized component to prevent unnecessary re-renders
export default memo(Home);
