"use client";

import { useEffect, useState } from "react";
import { api, AboutData } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AboutModule() {
  const [about, setAbout] = useState<AboutData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getAbout()
      .then(setAbout)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading...</div>
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

  if (!about) return null;

  return (
    <ScrollArea className="h-full">
      <div className="p-6 space-y-6">
        {/* Header with Profile */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-green-500/30 shadow-lg">
              <img 
                src="/profile.png" 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Name and Tagline */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{about.name}</h1>
            <p className="text-xl text-green-400 mb-3">{about.tagline}</p>
            <div className="border-l-4 border-green-500 pl-4 bg-white/5 backdrop-blur-sm rounded-r p-3">
              <p className="text-white/80">{about.short}</p>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-green-500 flex items-center gap-2">
            <span className="text-blue-400">$</span> cat skills.json
          </h2>
          
          <div className="grid gap-4 md:grid-cols-3">
            {/* Frontend Skills */}
            <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 backdrop-blur-sm border border-green-500/20 rounded-lg p-4">
              <h3 className="text-green-400 font-semibold mb-3 text-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Frontend
              </h3>
              <div className="flex flex-wrap gap-2">
                {about.skills.frontend.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-green-500/20 border border-green-500/40 rounded-full text-sm text-green-300 font-medium hover:bg-green-500/30 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Backend Skills */}
            <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 backdrop-blur-sm border border-blue-500/20 rounded-lg p-4">
              <h3 className="text-blue-400 font-semibold mb-3 text-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                Backend
              </h3>
              <div className="flex flex-wrap gap-2">
                {about.skills.backend.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/40 rounded-full text-sm text-blue-300 font-medium hover:bg-blue-500/30 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* ML/AI Skills */}
            <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 backdrop-blur-sm border border-purple-500/20 rounded-lg p-4">
              <h3 className="text-purple-400 font-semibold mb-3 text-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                ML/AI
              </h3>
              <div className="flex flex-wrap gap-2">
                {about.skills.ml.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 bg-purple-500/20 border border-purple-500/40 rounded-full text-sm text-purple-300 font-medium hover:bg-purple-500/30 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-white/10 bg-white/5 backdrop-blur-sm rounded p-3">
          <p className="text-sm text-white/60">
            💡 Type <span className="text-green-400 font-mono">contact</span> to get in touch or <span className="text-blue-400 font-mono">projects</span> to see my work.
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}
