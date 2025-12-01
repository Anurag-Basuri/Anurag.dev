import React from "react";
import { AboutModule } from "@/components/modules/AboutModule";
import { ProjectsModule } from "@/components/modules/ProjectsModule";
import { JourneyModule } from "@/components/modules/JourneyModule";
import { BlogModule } from "@/components/modules/BlogModule";
import { ContactModule } from "@/components/modules/ContactModule";

export const moduleRegistry: Record<string, React.ReactNode> = {
  about: <AboutModule />,
  projects: <ProjectsModule />,
  journey: <JourneyModule />,
  blog: <BlogModule />,
  contact: <ContactModule />,
  "ai-lab": <div className="p-4 text-muted-foreground">AI Lab coming soon...</div>,
};

export const getModuleComponent = (id: string): React.ReactNode => {
    return moduleRegistry[id] || <div className="p-4">Module not found</div>;
};
