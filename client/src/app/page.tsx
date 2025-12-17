'use client';

import { BootAnimation } from '@/components/layout/BootAnimation';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '@/store';
import { useEffect, useState, useCallback, memo } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';

// Lazy load MainLayout with loading fallback
const MainLayout = dynamic(
	() => import('@/components/layout/MainLayout').then(mod => mod.MainLayout),
	{
		ssr: false,
		loading: () => (
			<div className="fixed inset-0 bg-black flex items-center justify-center">
				<div className="w-8 h-8 border-4 border-[#00ff41]/20 border-t-[#00ff41] rounded-full animate-spin" />
			</div>
		),
	},
);

// Session storage key constant
const BOOT_SESSION_KEY = 'anuragos-boot-complete';

function Home() {
	const [bootComplete, setBootComplete] = useAtom(bootCompleteAtom);
	const [isHydrated, setIsHydrated] = useState(false);

	// Initialize boot state on mount
	useEffect(() => {
		try {
			// Clear session storage to force boot animation on page refresh
			sessionStorage.removeItem(BOOT_SESSION_KEY);

			// Reset boot complete state
			setBootComplete(false);

			// Mark as hydrated (defer to avoid synchronous state update)
			setTimeout(() => setIsHydrated(true), 0);
		} catch (error) {
			// Handle sessionStorage not available (private browsing, etc.)
			console.warn('SessionStorage not available:', error);
			setTimeout(() => setIsHydrated(true), 0);
		}
	}, [setBootComplete]);

	// Prevent flash of content during hydration
	if (!isHydrated) {
		return (
			<div className="fixed inset-0 bg-black flex items-center justify-center">
				<div
					className="w-8 h-8 border-4 border-[#00ff41]/20 border-t-[#00ff41] rounded-full animate-spin"
					role="status"
					aria-label="Loading"
				/>
			</div>
		);
	}

	return (
		<>
			<AnimatePresence mode="wait">
				{!bootComplete && <BootAnimation key="boot" />}
			</AnimatePresence>
			{bootComplete && <MainLayout key="main" />}
		</>
	);
}

// Export memoized component to prevent unnecessary re-renders
export default memo(Home);
