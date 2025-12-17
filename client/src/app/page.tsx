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
	const [isPreloaded, setIsPreloaded] = useState(false);

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

	// Intelligent preloading strategy:
	// Start preloading MainLayout early during boot animation
	// This ensures instant display when boot completes
	useEffect(() => {
		if (!isHydrated) return;

		// Start preloading after a short delay (during first boot phase)
		const preloadTimer = setTimeout(
			async () => {
				try {
					// Preload MainLayout module
					await import('@/components/layout/MainLayout');

					// Also preload critical dependencies in parallel
					await Promise.all([
						import('@/components/os/terminal/CLI'),
						import('@/components/os/editor/EditorArea'),
						import('@/components/os/shell/TopBar'),
						import('@/components/os/shell/Taskbar'),
					]);

					setIsPreloaded(true);
					console.log('✅ MainLayout preloaded successfully');
				} catch (error) {
					console.warn('Failed to preload MainLayout:', error);
					// Still mark as preloaded to continue
					setIsPreloaded(true);
				}
			},
			400, // Start preloading 400ms into boot animation
		);

		return () => clearTimeout(preloadTimer);
	}, [isHydrated]);

	// Prevent flash of content during hydration
	if (!isHydrated) {
		return <LoadingFallback />;
	}

	return (
		<>
			{/* Boot Animation - Always visible when not complete */}
			<AnimatePresence mode="wait">
				{!bootComplete && <BootAnimation key="boot" />}
			</AnimatePresence>

			{/* 
                MainLayout - Rendered early for preloading but hidden until boot complete
                This ensures it's fully loaded and ready when boot animation finishes
            */}
			<div
				style={{
					visibility: bootComplete ? 'visible' : 'hidden',
					position: bootComplete ? 'relative' : 'fixed',
					top: 0,
					left: 0,
					width: '100%',
					height: '100%',
					zIndex: bootComplete ? 'auto' : -1,
				}}
			>
				<Suspense fallback={<LoadingFallback />}>
					<MainLayout key="main" />
				</Suspense>
			</div>
		</>
	);
}

// Export memoized component to prevent unnecessary re-renders
export default memo(Home);
