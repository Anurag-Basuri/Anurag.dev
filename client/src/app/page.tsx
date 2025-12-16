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
	useEffect(() => {
		// Clear session storage on page load/refresh to force boot animation
		sessionStorage.removeItem('booted');

		// Reset boot complete state
		setBootComplete(false);
	}, [setBootComplete]);

	return (
		<>
			<AnimatePresence mode="wait">
				{!bootComplete && <BootAnimation key="boot" />}
			</AnimatePresence>
			{bootComplete && <MainLayout key="main" />}
		</>
	);
}
