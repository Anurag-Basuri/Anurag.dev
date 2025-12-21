import React, { lazy, Suspense } from 'react';
import {
	Info,
	LayoutDashboard,
	Terminal,
	Code,
	Contact,
	GitBranch,
	Book,
	ShieldQuestion,
	type LucideIcon,
} from 'lucide-react';

// Lazy load all app modules for better performance
const AboutModule = lazy(() =>
	import('@/modules/about').then(m => ({ default: m.AboutModule })),
);
const ProjectsModule = lazy(() =>
	import('@/modules/projects').then(m => ({ default: m.ProjectsModule })),
);
const JourneyModule = lazy(() =>
	import('@/modules/journey').then(m => ({ default: m.JourneyModule })),
);
const CertificationModule = lazy(() =>
	import('@/modules/certifications').then(m => ({ default: m.CertificationModule })),
);
const AILabModule = lazy(() =>
	import('@/modules/ai-lab').then(m => ({ default: m.AILabModule })),
);
const BlogModule = lazy(() =>
	import('@/modules/blog').then(m => ({ default: m.BlogModule })),
);
const ContactModule = lazy(() =>
	import('@/modules/contact').then(m => ({ default: m.ContactModule })),
);
const CodingStatsModule = lazy(() =>
	import('@/modules/coding-stats').then(m => ({ default: m.CodingStatsModule })),
);

// Loading fallback component
const ModuleLoader = () => (
	<div className="flex items-center justify-center h-full w-full">
		<div className="flex flex-col items-center gap-4">
			<div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
			<div className="text-sm text-muted-foreground font-mono">Loading module...</div>
		</div>
	</div>
);

// Wrapper to add Suspense boundary
const withSuspense = (Component: React.ComponentType | React.LazyExoticComponent<any>) => (
	<Suspense fallback={<ModuleLoader />}>
		<Component />
	</Suspense>
);

export const moduleRegistry: Record<string, React.ReactNode> = {
	about: withSuspense(AboutModule),
	projects: withSuspense(ProjectsModule),
	journey: withSuspense(JourneyModule),
	certifications: withSuspense(CertificationModule),
	blog: withSuspense(BlogModule),
	contact: withSuspense(ContactModule),
	ailab: withSuspense(AILabModule),
	profiles: withSuspense(CodingStatsModule),
};

export type AppModuleId = keyof typeof moduleRegistry;

const moduleMeta: Record<string, { title: string; icon: LucideIcon }> = {
	about: { title: 'About Me', icon: Info },
	projects: { title: 'Projects', icon: LayoutDashboard },
	journey: { title: 'My Journey', icon: GitBranch },
	certifications: { title: 'Certifications', icon: ShieldQuestion },
	blog: { title: 'Blog', icon: Book },
	contact: { title: 'Contact', icon: Contact },
	ailab: { title: 'AI Lab', icon: Code },
	profiles: { title: 'Coding Profiles', icon: Code },
	terminal: { title: 'Terminal', icon: Terminal },
};

export const getModuleComponent = (id: string): React.ReactNode => {
	// Handle complex paths: "about/whoami.md" -> "about"
	const moduleId = id.includes('/') ? id.split('/')[0] : id;
	return moduleRegistry[moduleId] || <div className="p-4">Module not found: {id}</div>;
};

export function getModuleIcon(id: string): LucideIcon {
	return moduleMeta[id]?.icon || moduleMeta.default.icon;
}

export function getModuleTitle(id: string): string {
	return moduleMeta[id]?.title || moduleMeta.default.title;
}

export function isValidModuleId(id: string): boolean {
	return id in moduleRegistry;
}
