"use client";

import { useEffect, useState } from "react";
import { api, Project } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ExternalLink, Github, Star, GitFork } from "lucide-react";

export function ProjectsModule() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getProjects()
      .then((data) => setProjects(data.projects))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading projects...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6 font-mono">
        <div>
          <h1 className="text-2xl font-bold text-green-500 mb-2">$ ls projects/</h1>
          <p className="text-muted-foreground">
            {projects.length} project{projects.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="space-y-4">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border border-muted rounded-lg p-4 hover:border-green-500/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-xl font-bold text-green-400">{project.title}</h2>
                <div className="flex gap-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-green-400 transition-colors"
                      title="View on GitHub"
                    >
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-blue-400 transition-colors"
                      title="View Live"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>

              <p className="text-sm text-muted-foreground mb-3">{project.description}</p>

              <div className="flex flex-wrap gap-2 mb-3">
                {project.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-blue-400"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              {(project.stars !== undefined || project.forks !== undefined) && (
                <div className="flex gap-4 text-xs text-muted-foreground">
                  {project.stars !== undefined && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      <span>{project.stars}</span>
                    </div>
                  )}
                  {project.forks !== undefined && (
                    <div className="flex items-center gap-1">
                      <GitFork className="w-3 h-3" />
                      <span>{project.forks}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No projects found.</p>
            <p className="text-sm mt-2">Check back soon for updates!</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
