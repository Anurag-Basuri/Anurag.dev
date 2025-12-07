'use client';

import { MainLayout } from '@/components/layout/MainLayout';
import { BootAnimation } from '@/components/layout/BootAnimation';

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
