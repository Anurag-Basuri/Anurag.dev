"use client";

import { useAtom } from "jotai";
import { windowsAtom, activeWindowIdAtom } from "@/store/atoms";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

export function EditorArea() {
  const [windows, setWindows] = useAtom(windowsAtom);
  const [activeWindowId, setActiveWindowId] = useAtom(activeWindowIdAtom);

  const activeWindow = windows.find((w) => w.id === activeWindowId);

  const handleClose = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newWindows = windows.filter((w) => w.id !== id);
    setWindows(newWindows);
    
    if (activeWindowId === id) {
        // If closing active window, activate the last one if available
        if (newWindows.length > 0) {
            setActiveWindowId(newWindows[newWindows.length - 1].id);
        } else {
            setActiveWindowId(null);
        }
    }
  };

  return (
    <div className="h-full flex flex-col bg-background/50 backdrop-blur-sm">
      {/* Tab Bar */}
      <div className="h-9 flex bg-background/60 border-b border-white/10 overflow-hidden">
        <ScrollArea className="w-full" orientation="horizontal">
            <div className="flex">
                {windows.map((window) => (
                <div
                    key={window.id}
                    onClick={() => setActiveWindowId(window.id)}
                    className={cn(
                    "h-9 px-3 flex items-center gap-2 text-xs border-r border-white/10 cursor-pointer select-none min-w-[120px] max-w-[200px] group relative",
                    activeWindowId === window.id
                        ? "bg-white/10 text-foreground border-t-2 border-t-blue-500"
                        : "bg-transparent text-muted-foreground hover:bg-white/5"
                    )}
                >
                    <span className="truncate flex-1">{window.title}</span>
                    <button
                        onClick={(e) => handleClose(window.id, e)}
                        className={cn(
                            "p-0.5 rounded-sm hover:bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity",
                            activeWindowId === window.id && "opacity-100"
                        )}
                    >
                    <X className="w-3 h-3" />
                    </button>
                </div>
                ))}
            </div>
            <ScrollBar orientation="horizontal" className="h-2.5" />
        </ScrollArea>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeWindow ? (
          <div className="h-full w-full overflow-auto p-4">
             {/* We render the component directly. 
                 Note: In a real app, we might want to keep all components mounted and just hide them 
                 to preserve state (like scroll position), but for now conditional rendering is fine. 
             */}
            {activeWindow.component}
          </div>
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground opacity-50 select-none">
            <div className="text-6xl mb-4">⌘</div>
            <p className="text-sm">Show All Commands</p>
            <p className="text-xs mt-2">Ctrl+Shift+P</p>
          </div>
        )}
      </div>
    </div>
  );
}
