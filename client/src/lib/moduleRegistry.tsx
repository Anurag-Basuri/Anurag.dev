import React, { lazy, Suspense } from 'react';
import {
	Info,
	LayoutDashboard,
	Contact,
	Code,
	Book,
	ShieldQuestion,
	Briefcase,
	GraduationCap,
	Medal,
	type LucideIcon,
} from 'lucide-react';
import type { AppModuleId } from './routes';

const ProfileModule = lazy(() => import('@/modules/profile').then(m => ({ default: m.ProfileModule })));
const ExperienceModule = lazy(() => import('@/modules/experience').then(m => ({ default: m.ExperienceModule })));
const EducationModule = lazy(() => import('@/modules/education').then(m => ({ default: m.EducationModule })));
const ProjectsModule = lazy(() => import('@/modules/projects').then(m => ({ default: m.ProjectsModule })));
const AchievementsModule = lazy(() => import('@/modules/achievements').then(m => ({ default: m.AchievementsModule })));
const CertificationsModule = lazy(() => import('@/modules/certifications').then(m => ({ default: m.CertificationModule })));
const BlogModule = lazy(() => import('@/modules/blog').then(m => ({ default: m.BlogModule })));
const CodingStatsModule = lazy(() => import('@/modules/coding-stats').then(m => ({ default: m.CodingStatsModule })));
const ContactModule = lazy(() => import('@/modules/contact').then(m => ({ default: m.ContactModule })));

const ModuleLoader = () => (
	<div className="flex items-center justify-center h-full w-full">
		<div className="flex flex-col items-center gap-4">
			<div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
			<div className="text-sm text-muted-foreground font-mono">Loading module...</div>
		</div>
	</div>
);

type ModuleComponent = React.ComponentType<unknown>;
type LazyModuleComponent = React.LazyExoticComponent<ModuleComponent>;

const withSuspense = (Component: ModuleComponent | LazyModuleComponent) => (
	<Suspense fallback={<ModuleLoader />}>
		<Component />
	</Suspense>
);

type ModuleConfig = {
	component: React.ReactNode;
	icon: LucideIcon;
	title: string;
};

const moduleConfigs: Record<AppModuleId, ModuleConfig> = {
	profile: {
		component: withSuspense(ProfileModule),
		icon: Info,
		title: 'Profile',
	},
	experience: {
		component: withSuspense(ExperienceModule),
		icon: Briefcase,
		title: 'Experience',
	},
	education: {
		component: withSuspense(EducationModule),
		icon: GraduationCap,
		title: 'Education',
	},
	projects: {
		component: withSuspense(ProjectsModule),
		icon: LayoutDashboard,
		title: 'Projects',
	},
	achievements: {
		component: withSuspense(AchievementsModule),
		icon: Medal,
		title: 'Achievements',
	},
	certifications: {
		component: withSuspense(CertificationsModule),
		icon: ShieldQuestion,
		title: 'Certifications',
	},
	blog: {
		component: withSuspense(BlogModule),
		icon: Book,
		title: 'Blog',
	},
	coding_stats: {
		component: withSuspense(CodingStatsModule),
		icon: Code,
		title: 'Coding Stats',
	},
	contact: {
		component: withSuspense(ContactModule),
		icon: Contact,
		title: 'Contact',
	},
};

export const moduleRegistry = Object.fromEntries(
	Object.entries(moduleConfigs).map(([id, config]) => [id, config.component]),
) as Record<string, React.ReactNode>;

export const getModuleComponent = (id: string): React.ReactNode => {
	const moduleId = id.includes('/') ? id.split('/')[0] : id;
	return moduleRegistry[moduleId] || <div className="p-4">Module not found: {id}</div>;
};

export function getModuleIcon(id: string): LucideIcon {
	return moduleConfigs[id as AppModuleId]?.icon ?? Info;
}

export function getModuleTitle(id: string): string {
	return moduleConfigs[id as AppModuleId]?.title ?? 'Unknown';
}

export function isValidModuleId(id: string): id is AppModuleId {
	return id in moduleConfigs;
}
