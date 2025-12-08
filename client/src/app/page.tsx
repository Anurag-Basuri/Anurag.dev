'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { BootAnimation } from '@/components/layout/BootAnimation';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '@/store/atoms';
import { useEffect, useState } from 'react';

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

	return <>{bootComplete ? <MainLayout /> : <BootAnimation />}</>;
}
