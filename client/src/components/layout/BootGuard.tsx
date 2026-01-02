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
	const [bootComplete] = useAtom(bootCompleteAtom);

	// "Overlay" pattern: Always render children (app content) so they load/mount in background.
	// Render Introduction (Boot Screen) on top with a high z-index.
	return (
		<>
			{children}
			{!bootComplete && <Introduction />}
		</>
	);
}
