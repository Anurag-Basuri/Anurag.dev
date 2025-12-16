'use client';

import { BootAnimation } from '@/components/layout/BootAnimation';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '@/store';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';

const MainLayout = dynamic(
	() => import('@/components/layout/MainLayout').then(mod => mod.MainLayout),
	{
		ssr: false,
	},
);

export default function Home() {
	const [bootComplete, setBootComplete] = useAtom(bootCompleteAtom);
	const [isSessionRestored, setIsSessionRestored] = useState(false);

	useEffect(() => {
		// On refresh, we always want to boot from scratch
		// so we just confirm the component is mounted/restored
		setTimeout(() => setIsSessionRestored(true), 0);
	}, []);

	// Show nothing until we've checked session
	if (!isSessionRestored) {
		return (
			<div className="fixed inset-0 bg-black flex items-center justify-center">
				<div className="w-8 h-8 border-4 border-[#00ff41]/20 border-t-[#00ff41] rounded-full animate-spin" />
			</div>
		);
	}

	// Check if we should skip boot animation based on session storage
	const shouldSkipBoot = typeof window !== 'undefined' && sessionStorage.getItem('booted');

	return (
		<>
			<MainLayout />
			<AnimatePresence mode="wait">
				{!bootComplete && !shouldSkipBoot && <BootAnimation key="boot" />}
			</AnimatePresence>
		</>
	);
}
