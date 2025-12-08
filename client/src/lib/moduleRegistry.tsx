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

const moduleIcons: Record<string, LucideIcon> = {
	about: Info,
	projects: LayoutDashboard,
	terminal: Terminal,
	'coding-stats': Code,
	contact: Contact,
	journey: GitBranch,
	blog: Book,
	default: ShieldQuestion,
};

export const getModuleComponent = (id: string): React.ReactNode => {
	// Handle complex paths: "about/whoami.md" -> "about"
	const moduleId = id.includes('/') ? id.split('/')[0] : id;
	return moduleRegistry[moduleId] || <div className="p-4">Module not found: {id}</div>;
};

export function getModuleIcon(id: string): LucideIcon {
	return moduleIcons[id] || moduleIcons.default;
}

export function getModuleTitle(id: string): string {
	// Handle complex paths: "about/whoami.md" -> "about"
	const moduleId = id.includes('/') ? id.split('/')[0] : id;
	switch (moduleId) {
		case 'about':
			return 'About Me';
		case 'projects':
			return 'Projects';
		case 'journey':
			return 'Journey';
		case 'blog':
			return 'Blog';
		case 'contact':
			return 'Contact';
		case 'ai-lab':
			return 'AI Lab';
		case 'secret':
			return 'Secret';
		case 'stats.exe':
			return 'Coding Stats';
		default:
			return 'Unknown Module';
	}
}
