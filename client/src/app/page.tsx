'use client';

import { MainLayout } from '@/components/core/MainLayout';
import { BootAnimation } from '@/components/core/BootAnimation';

export default function Home() {
	return (
		<>
			{/* Force dark theme for boot animation */}
			<div className="dark">
				<BootAnimation />
			</div>
			<MainLayout />
		</>
	);
}
