'use client';

import { useAtom } from 'jotai';
import { bootCompleteAtom } from '../atoms';
import { BootScreen } from './BootScreen';

export function BootGuard({ children }: { children: React.ReactNode }) {
	const [bootComplete] = useAtom(bootCompleteAtom);

	return (
		<>
			{children}
			{!bootComplete && <BootScreen />}
		</>
	);
}

