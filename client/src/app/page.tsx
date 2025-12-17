'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { bootCompleteAtom } from '@/store';
import { AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamically import BootAnimation to avoid SSR issues
const BootAnimation = dynamic(
	() =>
		import('@/components/layout/BootAnimation')
			.then(mod => ({ default: mod.BootAnimation }))
			.catch(() => ({
				default: () => {
					// Fallback if boot animation fails to load
					const [, setBootComplete] = useAtom(bootCompleteAtom);
					useEffect(() => setBootComplete(true), [setBootComplete]);
					return null;
				},
			})),
	{
		ssr: false,
		loading: () => (
			<div className="fixed inset-0 bg-black flex items-center justify-center">
				<div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
			</div>
		),
	},
);

export default function HomePage() {
	const router = useRouter();
	const [bootComplete] = useAtom(bootCompleteAtom);

	// Constants
	const BOOT_REDIRECT_DELAY = 500;

	useEffect(() => {
		if (bootComplete) {
			// Redirect to app when boot completes
			const timeout = setTimeout(() => {
				router.push('/app');
			}, BOOT_REDIRECT_DELAY);
			return () => clearTimeout(timeout);
		}
	}, [bootComplete, router]);

	return (
		<div className="fixed inset-0 bg-black">
			<AnimatePresence mode="wait">
				{!bootComplete && <BootAnimation key="boot" />}
			</AnimatePresence>

			{/* Loading state after boot completes */}
			{bootComplete && (
				<div className="fixed inset-0 flex items-center justify-center">
					<div className="flex flex-col items-center gap-4">
						<div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
						<div className="text-emerald-500 text-sm font-mono">
							INITIALIZING DESKTOP...
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
