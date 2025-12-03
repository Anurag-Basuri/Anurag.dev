'use client';

import { MainLayout } from '@/components/core/MainLayout';
import { BootAnimation } from '@/components/core/BootAnimation';

export default function Home() {
	return (
		<>
			<BootAnimation />
			<MainLayout />
		</>
	);
}
