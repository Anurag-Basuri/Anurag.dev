import React from 'react';
import { AboutModule } from '@/components/apps/about';
import { ProjectsModule } from '@/components/apps/projects';
import { JourneyModule } from '@/components/apps/journey';
import { BlogModule } from '@/components/apps/blog';
import { ContactModule } from '@/components/apps/contact';
import { SecretModule } from '@/components/apps/secret';
import CodingStatsModule from '@/components/apps/coding-stats';
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

export const moduleRegistry: Record<string, React.ReactNode> = {
	about: <AboutModule />,
	projects: <ProjectsModule />,
	journey: <JourneyModule />,
	blog: <BlogModule />,
	contact: <ContactModule />,
	'ai-lab': <div className="p-4 text-muted-foreground">AI Lab coming soon...</div>,
	secret: <SecretModule />,
	'stats.exe': <CodingStatsModule />,
};

const moduleMeta: Record<string, { title: string; icon: LucideIcon }> = {
	about: { title: 'About Me', icon: Info },
	projects: { title: 'Projects', icon: LayoutDashboard },
	terminal: { title: 'Terminal', icon: Terminal },
	'coding-stats': { title: 'Coding Stats', icon: Code },
	contact: { title: 'Contact', icon: Contact },
	journey: { title: 'My Journey', icon: GitBranch },
	blog: { title: 'Blog', icon: Book },
	secret: { title: 'Secret', icon: ShieldQuestion },
	'ai-lab': { title: 'AI Lab', icon: Code },
	'stats.exe': { title: 'Coding Stats', icon: Code },
	default: { title: 'Untitled', icon: ShieldQuestion },
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
