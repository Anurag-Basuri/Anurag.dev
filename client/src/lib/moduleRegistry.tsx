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

function lazyWithRetry<T extends React.ComponentType<any>>(
	importer: () => Promise<{ default: T } | Record<string, any>>,
	exportName?: string
) {
	return lazy(async () => {
		try {
			const mod = await importer();
			if (exportName && mod && typeof (mod as any)[exportName] === 'function') {
				return { default: (mod as any)[exportName] as T };
			}
			if ((mod as any)?.default && typeof (mod as any).default === 'function') {
				return { default: (mod as any).default as T };
			}
			if (mod && typeof mod === 'object') {
				for (const val of Object.values(mod)) {
					if (typeof val === 'function') {
						return { default: val as T };
					}
				}
			}
			throw new Error(`Failed to resolve component from module (exportName: ${exportName})`);
		} catch (error: any) {
			if (typeof window !== 'undefined') {
				const isChunkError =
					error?.name === 'ChunkLoadError' ||
					/Loading.*chunk.*failed/i.test(error?.message || '');
				if (isChunkError) {
					const hasRefreshed = sessionStorage.getItem('chunk_refreshed');
					if (!hasRefreshed) {
						sessionStorage.setItem('chunk_refreshed', 'true');
						window.location.reload();
					}
				}
			}
			throw error;
		}
	});
}

const ProfileModule = lazyWithRetry(() => import('@/modules/profile'), 'ProfileModule');
const ExperienceModule = lazyWithRetry(() => import('@/modules/experience'), 'ExperienceModule');
const EducationModule = lazyWithRetry(() => import('@/modules/education'), 'EducationModule');
const ProjectsModule = lazyWithRetry(() => import('@/modules/projects'), 'ProjectsModule');
const AchievementsModule = lazyWithRetry(() => import('@/modules/achievements'), 'AchievementModule');
const CertificationsModule = lazyWithRetry(() => import('@/modules/certifications'), 'CertificationModule');
const BlogModule = lazyWithRetry(() => import('@/modules/blog'), 'BlogModule');
const CodingStatsModule = lazyWithRetry(() => import('@/modules/coding-stats'), 'CodingStatsModule');
const ContactModule = lazyWithRetry(() => import('@/modules/contact'), 'ContactModule');

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
	achievements: {
		component: withSuspense(AchievementsModule),
		icon: Medal,
		title: 'Achievements',
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

export const getModuleComponent = (id: AppModuleId): React.ReactNode => {
	const config = moduleConfigs[id];
	return config ? config.component : null;
};

export const getModuleIcon = (id: AppModuleId): LucideIcon | null => {
	const config = moduleConfigs[id];
	return config ? config.icon : null;
};

export const getModuleTitle = (id: AppModuleId): string | null => {
	const config = moduleConfigs[id];
	return config ? config.title : null;
};

export const isValidModuleId = (id: string): id is AppModuleId => {
	return id in moduleConfigs;
};