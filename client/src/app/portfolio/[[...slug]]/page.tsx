import type { Metadata } from 'next';
import { getModuleMetadata, resolveModuleFromSlug, getAllModuleIds } from '@/lib/routes';
import { PortfolioContent } from '../PortfolioContent';

interface PageProps {
	params: Promise<{
		slug?: string[];
	}>;
}

// Dynamic metadata generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
	const { slug } = await params;

	// Root or Profile
	if (!slug || slug.length === 0) {
		const aboutMeta = getModuleMetadata('profile');
		return {
			title: aboutMeta.title,
			description: aboutMeta.description,
			keywords: aboutMeta.keywords,
		};
	}

	const moduleId = resolveModuleFromSlug(slug);

	if (!moduleId) {
		return {
			title: 'Not Found',
			description: 'The requested page does not exist.',
		};
	}

	const metadata = getModuleMetadata(moduleId);

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

	// Determine initial section from URL (for deep links)
	let initialSection = 'profile';
	if (slug && slug.length > 0) {
		const moduleId = resolveModuleFromSlug(slug);
		if (moduleId) initialSection = moduleId;
	}

	return <PortfolioContent initialSection={initialSection} />;
}

// Pre-generate common routes for better performance
export async function generateStaticParams() {
	const modules = getAllModuleIds();
	return [{ slug: [] }, ...modules.map(id => ({ slug: [id] }))];
}
