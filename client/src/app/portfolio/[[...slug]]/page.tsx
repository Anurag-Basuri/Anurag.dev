import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { getModuleComponent } from '@/lib/moduleRegistry';
import { getModuleMetadata, resolveModuleFromSlug, getAllModuleIds } from '@/lib/routes';
import { ModuleLoader } from '@/components/common/Loader';
import { EmptyState } from '@/components/editor/EmptyState';

interface PageProps {
	params: Promise<{
		slug?: string[];
	}>;
}

// Dynamic metadata generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;

	// Root portfolio page: show desktop/empty state metadata
	if (!slug || slug.length === 0) {
		return {
			title: 'Portfolio',
			description:
				'Explore projects, journey, certifications, blog posts, and ways to connect.',
		};
	}

	const moduleId = resolveModuleFromSlug(slug);

	// Invalid slug: let Next render 404, but keep metadata sane
	if (!moduleId) {
		return {
			title: 'Not Found',
			description: 'The requested page does not exist.',
		};
	}

	const metadata = getModuleMetadata(moduleId);

	// IMPORTANT: return a short title so root layout template applies
	// Root layout already does: "%s | Anurag Basuri"
	return {
		title: metadata.title,
		description: metadata.description,
		keywords: metadata.keywords,
		openGraph: {
			title: metadata.title,
			description: metadata.description,
			type: 'website',
		},
		twitter: {
			card: 'summary_large_image',
			title: metadata.title,
			description: metadata.description,
		},
	};
}

export default async function PortfolioModulePage({ params }: PageProps) {
	const { slug } = await params;

	// Root: EmptyState (transparent)
	if (!slug || slug.length === 0) {
		return <EmptyState />;
	}

	const moduleId = resolveModuleFromSlug(slug);

	// Invalid route: 404 (not EmptyState)
	if (!moduleId) {
		notFound();
	}

	const title = getModuleMetadata(moduleId).title;

	return (
		<Suspense fallback={<ModuleLoader message={`Loading ${title}...`} />}>
			{getModuleComponent(moduleId)}
		</Suspense>
	);
}

// Pre-generate common routes for better performance
export async function generateStaticParams() {
	const modules = getAllModuleIds();
	return [{ slug: [] }, ...modules.map(id => ({ slug: [id] }))];
}
