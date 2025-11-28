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
      <div className="p-6 space-y-6 font-mono">
        <div>
          <h1 className="text-3xl font-bold text-green-500 mb-2">{about.name}</h1>
          <p className="text-xl text-blue-400">{about.tagline}</p>
        </div>

        <div className="border-l-2 border-green-500 pl-4">
          <p className="text-muted-foreground">{about.short}</p>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-green-500">$ cat skills.json</h2>
          
          <div className="space-y-3 pl-4">
            <div>
              <h3 className="text-blue-400 font-semibold mb-1">Frontend:</h3>
              <div className="flex flex-wrap gap-2">
                {about.skills.frontend.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-green-500/10 border border-green-500/30 rounded text-sm text-green-400"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-blue-400 font-semibold mb-1">Backend:</h3>
              <div className="flex flex-wrap gap-2">
                {about.skills.backend.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-blue-500/10 border border-blue-500/30 rounded text-sm text-blue-400"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-blue-400 font-semibold mb-1">ML/AI:</h3>
              <div className="flex flex-wrap gap-2">
                {about.skills.ml.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-sm text-purple-400"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-muted">
          <p className="text-xs text-muted-foreground">
            Type 'contact' to get in touch or 'projects' to see my work.
          </p>
        </div>
      </div>
    </ScrollArea>
  );
}
