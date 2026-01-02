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

	if (!bootComplete) {
		return <Introduction />;
	}

	return <>{children}</>;
}
