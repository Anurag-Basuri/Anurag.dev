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
        x: windowState.position.x,
        y: windowState.position.y,
        width: 600,
        height: 400,
      }}
      minWidth={300}
      minHeight={200}
      bounds="window"
      dragHandleClassName="window-handle"
      className="z-50"
      onDragStop={(e, d) => {
        // Update position in atom if needed, for now local state handled by Rnd
      }}
    >
      <div className="h-full flex flex-col rounded-lg overflow-hidden border border-white/20 shadow-2xl bg-black/80 backdrop-blur-md text-white">
        {/* Title Bar */}
        <div className="window-handle h-9 bg-white/5 border-b border-white/10 flex items-center px-3 select-none cursor-default justify-between">
           <div className="flex items-center gap-2">
             <div className="flex gap-1.5 group">
                <button 
                    onClick={handleClose}
                    className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors flex items-center justify-center"
                >
                </button>
                <button 
                    onClick={handleMinimize}
                    className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
                ></button>
                <button className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors"></button>
             </div>
             <span className="ml-3 text-xs font-medium text-white/70">{windowState.title}</span>
           </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-black/40 relative">
           {windowState.component}
        </div>
      </div>
    </Rnd>
  );
}
