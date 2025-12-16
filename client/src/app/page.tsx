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
		// Check session storage to see if boot was already completed
		try {
			const sessionBooted = sessionStorage.getItem('booted');
			if (sessionBooted) {
				// User already booted in this session, skip animation
				setBootComplete(true);
				setTimeout(() => setIsSessionRestored(true), 0);
			} else {
				// New session, show boot animation
				setTimeout(() => setIsSessionRestored(true), 0);
			}
		} catch (e) {
			// sessionStorage not available, just proceed
			setTimeout(() => setIsSessionRestored(true), 0);
		}
	}, [setBootComplete]);

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
