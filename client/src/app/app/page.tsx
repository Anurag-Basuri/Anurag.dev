import { Suspense } from 'react';
import { Metadata } from 'next';
import { getModuleComponent } from '@/lib/moduleRegistry';
import { getModuleMetadata } from '@/lib/routes';
import { ModuleLoader } from '@/components/shared/ModuleLoader';

// Generate metadata for the default page
export async function generateMetadata(): Promise<Metadata> {
	const metadata = getModuleMetadata('about');

	return {
		title: `${metadata.title} | Anurag Basuri - Full Stack Engineer`,
		description: metadata.description,
		keywords: metadata.keywords,
		authors: [{ name: 'Anurag Basuri' }],
		openGraph: {
			title: `${metadata.title} | Anurag Basuri`,
			description: metadata.description,
			type: 'website',
			locale: 'en_US',
			siteName: 'Anurag Basuri Portfolio',
		},
		twitter: {
			card: 'summary_large_image',
			title: `${metadata.title} | Anurag Basuri`,
			description: metadata.description,
			creator: '@AnuragBasuri',
		},
	};
}

// Server component for better performance
export default async function AppDefaultPage() {
	return (
		<Suspense fallback={<ModuleLoader message="Loading About..." />}>
			<div className="h-full w-full overflow-auto">{getModuleComponent('about')}</div>
		</Suspense>
	);
}

// Enable static generation
export const revalidate = 3600; // Revalidate every hour
