"use client";

import { Rnd } from "react-rnd";
import { useAtom } from "jotai";
import { activeWindowIdAtom, windowsAtom, WindowState } from "@/store/atoms";
import { cn } from "@/lib/utils";

interface WindowProps {
  windowState: WindowState;
}

export function Window({ windowState }: WindowProps) {
  const [activeId, setActiveId] = useAtom(activeWindowIdAtom);
  const [windows, setWindows] = useAtom(windowsAtom);

  const isActive = activeId === windowState.id;

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWindows((prev) => prev.filter((w) => w.id !== windowState.id));
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    setWindows((prev) =>
      prev.map((w) => (w.id === windowState.id ? { ...w, isMinimized: true } : w))
    );
  };

  const handleFocus = () => {
    setActiveId(windowState.id);
  };

  if (windowState.isMinimized) return null;

  return (
    <Rnd
      default={{
        x: windowState.position?.x || 100,
        y: windowState.position?.y || 100,
        width: windowState.size?.width || 600,
        height: windowState.size?.height || 400,
      }}
      minWidth={300}
      minHeight={200}
      bounds="window"
      onDragStart={handleFocus}
      onResizeStart={handleFocus}
      className={cn(
        "bg-background border border-border shadow-2xl flex flex-col overflow-hidden rounded-md",
        isActive ? "z-50 ring-1 ring-ring" : "z-40 opacity-95"
      )}
      dragHandleClassName="window-header"
      onClick={handleFocus}
    >
      <div
        className={cn(
            "window-header h-9 bg-muted/80 backdrop-blur-sm border-b flex items-center justify-between px-3 cursor-move select-none transition-colors",
            isActive ? "bg-muted" : "bg-muted/50"
        )}
      >
        <div className="flex items-center gap-2 group">
            <div className="w-3 h-3 rounded-full bg-red-500/80 hover:bg-red-500 cursor-pointer transition-colors" onClick={handleClose} />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 hover:bg-yellow-500 cursor-pointer transition-colors" onClick={handleMinimize} />
            <div className="w-3 h-3 rounded-full bg-green-500/80 hover:bg-green-500 cursor-pointer transition-colors" />
        </div>
        <span className="text-xs font-medium text-muted-foreground absolute left-1/2 -translate-x-1/2 pointer-events-none">
            {windowState.title}
        </span>
      </div>
      <div className="flex-1 overflow-auto bg-background text-foreground relative">
        {windowState.component}
      </div>
    </Rnd>
  );
}
