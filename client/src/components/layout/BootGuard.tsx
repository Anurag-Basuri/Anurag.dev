'use client';

import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '@/store';
import dynamic from 'next/dynamic';

// Immediate black screen fallback - prevents any flash
const BootFallback = () => (
	<div className="fixed inset-0 bg-[#020202]" style={{ zIndex: 9999 }} aria-label="Loading..." />
);

// Dynamically import the full boot animation - use direct path, not barrel export
const BootScreen = dynamic(() => import('@/features/boot/components/BootScreen').then(mod => mod.BootScreen), {
	ssr: false,
	loading: BootFallback,
});

export function BootGuard({ children }: { children: React.ReactNode }) {
	const [bootComplete] = useAtom(bootCompleteAtom);

	// Mark body as hydrated immediately so CSS overlay fades
	useEffect(() => {
		document.body.classList.add('hydrated');
	}, []);

	// Add/remove body class to control CSS overlay fade
	useEffect(() => {
		if (bootComplete) {
			document.body.classList.add('boot-complete');
		} else {
			document.body.classList.remove('boot-complete');
		}
	}, [bootComplete]);

	// Blocking pattern: Don't render children until boot is complete
	if (!bootComplete) {
		return <BootScreen />;
	}

	return <>{children}</>;
}

