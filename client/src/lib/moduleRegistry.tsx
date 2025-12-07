import React from 'react';
import { AboutModule } from '@/components/apps/about';
import { ProjectsModule } from '@/components/apps/projects';
import { JourneyModule } from '@/components/apps/journey';
import { BlogModule } from '@/components/apps/blog';
import { ContactModule } from '@/components/apps/contact';
import { SecretModule } from '@/components/apps/secret';
import CodingStatsModule from '@/components/apps/coding-stats';

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

export const getModuleComponent = (id: string): React.ReactNode => {
	// Handle complex paths: "about/whoami.md" -> "about"
	const moduleId = id.includes('/') ? id.split('/')[0] : id;
	return moduleRegistry[moduleId] || <div className="p-4">Module not found: {id}</div>;
};
