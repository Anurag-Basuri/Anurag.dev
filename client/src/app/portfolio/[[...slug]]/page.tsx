import { Suspense } from 'react';
import { Metadata } from 'next';
import { getModuleComponent } from '@/lib/moduleRegistry';
import { getModuleMetadata, resolveModuleFromSlug, getAllModuleIds } from '@/lib/routes';
import { ModuleLoader } from '@/components/common/ModuleLoader';
import { notFound } from 'next/navigation';

interface PageProps {
	params: Promise<{
		slug?: string[];
	}>;
}

// Dynamic metadata generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const moduleId = resolveModuleFromSlug(slug || []);

	if (!moduleId) {
		return {
			title: 'Page Not Found',
		};
	}

	const metadata = getModuleMetadata(moduleId);

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

export default async function PortfolioModulePage({ params }: PageProps) {
	const { slug } = await params;
	const moduleId = resolveModuleFromSlug(slug || []);

	if (!moduleId) {
		return notFound();
	}

	const displayTitle = getModuleMetadata(moduleId).title;

	return (
		<Suspense fallback={<ModuleLoader message={`Loading ${displayTitle}...`} />}>
			<div className="h-full w-full overflow-auto">{getModuleComponent(moduleId)}</div>
		</Suspense>
	);
}

// Pre-generate common routes for better performance
export async function generateStaticParams() {
	const modules = getAllModuleIds();
	return [
		{ slug: [] }, // Default route
		...modules.map(id => ({ slug: [id] })),
	];
}
