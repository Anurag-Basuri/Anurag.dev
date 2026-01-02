'use client';

import React from 'react';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '@/store';
import dynamic from 'next/dynamic';

// Immediate black screen fallback - prevents any flash
const BootFallback = () => (
	<div className="fixed inset-0 bg-[#020202]" style={{ zIndex: 9999 }} aria-label="Loading..." />
);

// Dynamically import the full boot animation
const BootScreen = dynamic(() => import('@/features/boot').then(mod => mod.BootScreen), {
	ssr: false,
	loading: BootFallback,
});

export function BootGuard({ children }: { children: React.ReactNode }) {
	const [bootComplete] = useAtom(bootCompleteAtom);

	// Blocking pattern: Don't render children until boot is complete
	// This prevents any flash of content before the boot screen
	if (!bootComplete) {
		return <BootScreen />;
	}

	return <>{children}</>;
}
