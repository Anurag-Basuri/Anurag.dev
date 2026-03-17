'use client';

import { useEffect } from 'react';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '../atoms';
import { BootScreen } from './BootScreen';

const SESSION_KEY = 'portfolio_boot_complete_session';

export function BootGuard({ children }: { children: React.ReactNode }) {
	const [bootComplete, setBootComplete] = useAtom(bootCompleteAtom);

	useEffect(() => {
		try {
			const already = sessionStorage.getItem(SESSION_KEY) === '1';
			if (already) setBootComplete(true);
		} catch {
			// ignore storage errors
		}
	}, [setBootComplete]);

	useEffect(() => {
		if (!bootComplete) return;
		try {
			sessionStorage.setItem(SESSION_KEY, '1');
		} catch {
			// ignore storage errors
		}
	}, [bootComplete]);

	return (
		<>
			{children}
			{!bootComplete && <BootScreen />}
		</>
	);
}

