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
		try {
			const sessionBooted = sessionStorage.getItem('booted');
			if (sessionBooted) {
				setBootComplete(true);
			}
		} catch (e) {
			// sessionStorage not available
		}
		Promise.resolve().then(() => setIsSessionRestored(true));
	}, [setBootComplete]);

	if (!isSessionRestored) {
		return null; // or a loading spinner
	}

	return (
		<>
			<AnimatePresence mode="wait">{!bootComplete && <BootAnimation />}</AnimatePresence>
			<MainLayout />
		</>
	);
}
