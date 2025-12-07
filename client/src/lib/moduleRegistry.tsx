import React from 'react';
import { AboutModule } from '@/components/modules/AboutModule';
import { ProjectsModule } from '@/components/modules/ProjectsModule';
import { JourneyModule } from '@/components/modules/JourneyModule';
import { BlogModule } from '@/components/modules/BlogModule';
import { ContactModule } from '@/components/modules/ContactModule';
import { SecretModule } from '@/components/modules/SecretModule';
import CodingStatsModule from '@/components/modules/CodingStatsModule';

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
