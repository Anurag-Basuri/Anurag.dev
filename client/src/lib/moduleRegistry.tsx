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
const AboutModule = lazy(() => import('@/modules/about').then(m => ({ default: m.AboutModule })));
const ProjectsModule = lazy(() =>
	import('@/modules/projects').then(m => ({ default: m.ProjectsModule })),
);
const JourneyModule = lazy(() =>
	import('@/modules/journey').then(m => ({ default: m.JourneyModule })),
);
const CertificationModule = lazy(() =>
	import('@/modules/certifications').then(m => ({ default: m.CertificationModule })),
);
const AILabModule = lazy(() => import('@/modules/ai-lab').then(m => ({ default: m.AILabModule })));
const BlogModule = lazy(() => import('@/modules/blog').then(m => ({ default: m.BlogModule })));
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
type ModuleComponent = React.ComponentType<unknown>;
type LazyModuleComponent = React.LazyExoticComponent<ModuleComponent>;

const withSuspense = (Component: ModuleComponent | LazyModuleComponent) => (
	<Suspense fallback={<ModuleLoader />}>
		<Component />
	</Suspense>
);

// Module configuration type
type ModuleConfig = {
	component: React.ReactNode;
	icon: LucideIcon;
	title: string;
};

type ModuleId =
	| 'about'
	| 'projects'
	| 'journey'
	| 'certifications'
	| 'blog'
	| 'contact'
	| 'ailab'
	| 'profiles';

const moduleConfigs: Record<ModuleId, ModuleConfig> = {
	about: {
		component: withSuspense(AboutModule),
		icon: Info,
		title: 'About Me',
	},
	projects: {
		component: withSuspense(ProjectsModule),
		icon: LayoutDashboard,
		title: 'Projects',
	},
	journey: {
		component: withSuspense(JourneyModule),
		icon: GitBranch,
		title: 'My Journey',
	},
	certifications: {
		component: withSuspense(CertificationModule),
		icon: ShieldQuestion,
		title: 'Certifications',
	},
	blog: {
		component: withSuspense(BlogModule),
		icon: Book,
		title: 'Blog',
	},
	contact: {
		component: withSuspense(ContactModule),
		icon: Contact,
		title: 'Contact',
	},
	ailab: {
		component: withSuspense(AILabModule),
		icon: Code,
		title: 'AI Lab',
	},
	profiles: {
		component: withSuspense(CodingStatsModule),
		icon: Code,
		title: 'Coding Profiles',
	},
};

// Legacy export for backward compatibility
export const moduleRegistry = Object.fromEntries(
	Object.entries(moduleConfigs).map(([id, config]) => [id, config.component]),
) as Record<string, React.ReactNode>;

export type AppModuleId = ModuleId;

export const getModuleComponent = (id: string): React.ReactNode => {
	// Handle complex paths: "about/whoami.md" -> "about"
	const moduleId = id.includes('/') ? id.split('/')[0] : id;
	return moduleRegistry[moduleId] || <div className="p-4">Module not found: {id}</div>;
};

export function getModuleIcon(id: string): LucideIcon {
	return moduleConfigs[id as ModuleId]?.icon ?? Info;
}

export function getModuleTitle(id: string): string {
	return moduleConfigs[id as ModuleId]?.title ?? 'Unknown';
}

export function isValidModuleId(id: string): id is ModuleId {
	return id in moduleConfigs;
}
