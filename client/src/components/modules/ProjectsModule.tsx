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
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-green-500 mb-2 flex items-center gap-2">
            <span className="text-blue-400">$</span> ls projects/
          </h1>
          <p className="text-white/60">
            {projects.length} project{projects.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden hover:border-green-500/50 hover:shadow-lg transition-all group"
            >
              {/* Project Thumbnail */}
              <div className="relative h-40 bg-gradient-to-br from-green-500/20 to-blue-500/20 overflow-hidden">
                <img 
                  src={`https://placehold.co/600x400/1a1a1a/22c55e?text=${encodeURIComponent(project.title)}`}
                  alt={project.title}
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                
                {/* Links Overlay */}
                <div className="absolute top-3 right-3 flex gap-2">
                  {project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-green-500/80 transition-colors"
                      title="View on GitHub"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Github className="w-4 h-4" />
                    </a>
                  )}
                  {project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 bg-black/60 backdrop-blur-sm rounded-full text-white hover:bg-blue-500/80 transition-colors"
                      title="View Live"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Project Info */}
              <div className="p-4 space-y-3">
                <div>
                  <h2 className="text-xl font-bold text-green-400 mb-1 group-hover:text-green-300 transition-colors">
                    {project.title}
                  </h2>
                  <p className="text-sm text-white/70 line-clamp-2">{project.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {project.techStack.slice(0, 4).map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-xs text-blue-300 font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length > 4 && (
                    <span className="px-2 py-1 text-xs text-white/50">
                      +{project.techStack.length - 4}
                    </span>
                  )}
                </div>

                {(project.stars !== undefined || project.forks !== undefined) && (
                  <div className="flex gap-4 text-xs text-white/50 pt-2 border-t border-white/10">
                    {project.stars !== undefined && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
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
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12 text-white/60">
            <p>No projects found.</p>
            <p className="text-sm mt-2">Check back soon for updates!</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
