'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '@/store';
import dynamic from 'next/dynamic';

// Dynamically import Introduction to isolate it
const Introduction = dynamic(
	() => import('@/components/layout/Boot').then(mod => mod.Introduction),
	{
		ssr: false,
		loading: () => null,
	},
);

export function BootGuard({ children }: { children: React.ReactNode }) {
	const [bootComplete, setBootComplete] = useAtom(bootCompleteAtom);
	const [isChecking, setIsChecking] = React.useState(true);

	React.useEffect(() => {
		// Check if we've already booted this session
		const hasBooted = sessionStorage.getItem('anurag-portfolio-boot');
		if (hasBooted) {
			setBootComplete(true);
		}
		setIsChecking(false);
	}, [setBootComplete]);

	// Prevent flash of content or boot sequence while checking storage
	if (isChecking) return null;

	if (!bootComplete) {
		return <Introduction />;
	}

	return <>{children}</>;
}
