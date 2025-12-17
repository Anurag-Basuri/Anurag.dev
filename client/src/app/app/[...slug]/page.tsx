import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getModuleComponent } from '@/lib/moduleRegistry';
import { resolveModuleFromSlug, type ModuleId, getModuleMetadata } from '@/lib/routes';
import { ModuleLoader } from '@/components/common/ModuleLoader';

interface PageProps {
	params: { slug: string[] };
}

// Generate static params for all valid module routes
export async function generateStaticParams(): Promise<{ slug: string[] }[]> {
	const validModules: ModuleId[] = [
		'about',
		'projects',
		'journey',
		'certifications',
		'blog',
		'contact',
		'ailab',
		'profiles',
	];

	return validModules.map(moduleId => ({
		slug: [moduleId],
	}));
}

// Generate metadata for each route
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const moduleId = resolveModuleFromSlug(slug);

	if (!moduleId) {
		return {
			title: 'Page Not Found',
			description: 'The requested page could not be found.',
		};
	}

	const metadata = getModuleMetadata(moduleId);

	return {
		title: `${metadata.title} | Anurag Basuri`,
		description: metadata.description,
		keywords: metadata.keywords,
		authors: [{ name: 'Anurag Basuri' }],
		openGraph: {
			title: `${metadata.title} | Anurag Basuri`,
			description: metadata.description,
			type: 'website',
			locale: 'en_US',
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
export default async function ModulePage({ params }: PageProps) {
	const { slug } = await params;
	const moduleId = resolveModuleFromSlug(slug);

	if (!moduleId) {
		notFound();
	}

	return (
		<Suspense fallback={<ModuleLoader message={`Loading ${moduleId}...`} />}>
			<div className="h-full w-full overflow-auto">{getModuleComponent(moduleId)}</div>
		</Suspense>
	);
}

// Enable static generation with ISR
export const revalidate = 3600;
