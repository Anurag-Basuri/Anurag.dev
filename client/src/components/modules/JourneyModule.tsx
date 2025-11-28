"use client";

import { useEffect, useState } from "react";
import { api, JourneyEntry } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";

const categoryColors: Record<string, string> = {
  education: "text-blue-400 border-blue-400",
  work: "text-green-400 border-green-400",
  project: "text-purple-400 border-purple-400",
  achievement: "text-yellow-400 border-yellow-400",
};

export function JourneyModule() {
  const [journey, setJourney] = useState<JourneyEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getJourney()
      .then((data) => setJourney(data.items))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading journey...</div>
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
          <h1 className="text-2xl font-bold text-green-500 mb-2">$ cat journey/timeline.md</h1>
          <p className="text-muted-foreground">My professional journey</p>
        </div>

        <div className="relative space-y-6 pl-8">
          {/* Timeline line */}
          <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-muted"></div>

          {journey.map((entry, index) => (
            <div key={entry.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute -left-[26px] top-2 w-3 h-3 rounded-full bg-green-500 border-2 border-background"></div>

              <div className="border border-muted rounded-lg p-4 hover:border-green-500/50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-2xl font-bold text-green-400">{entry.year}</span>
                      <span
                        className={`px-2 py-0.5 border rounded text-xs uppercase ${
                          categoryColors[entry.category] || "text-muted-foreground border-muted"
                        }`}
                      >
                        {entry.category}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-foreground">{entry.title}</h2>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{entry.description}</p>
              </div>
            </div>
          ))}
        </div>

        {journey.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No journey entries found.</p>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
