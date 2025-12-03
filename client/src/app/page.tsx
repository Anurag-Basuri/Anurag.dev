'use client';

import { MainLayout } from '@/components/core/MainLayout';
import { BootAnimation } from '@/components/core/BootAnimation';
import HomeIntro from '@/components/core/HomeIntro';

export default function Home() {
	return (
		<>
			<BootAnimation />
			<HomeIntro />
			<MainLayout />
		</>
	);
}
