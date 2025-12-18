'use client';

import React, { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '@/store';
import dynamic from 'next/dynamic';

// Dynamically import Introduction to isolate it
const Introduction = dynamic(
	() => import('@/components/layout/Introduction').then(mod => mod.Introduction),
	{
		ssr: false,
		loading: () => null,
	},
);

export function BootGuard({ children }: { children: React.ReactNode }) {
	const [bootComplete, setBootComplete] = useAtom(bootCompleteAtom);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Prevent hydration mismatch by not rendering until mounted
	if (!mounted) return null;

	if (!bootComplete) {
		return <Introduction />;
	}

	return <>{children}</>;
}
