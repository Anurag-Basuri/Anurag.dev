"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderTree } from "@/components/core/FolderTree";
import { CLI } from "@/components/core/CLI";
import { initialFileSystem } from "@/lib/data";

import { WindowManager } from "@/components/core/WindowManager";
import { useAtom } from "jotai";
import { windowsAtom } from "@/store/atoms";
import { getModuleComponent } from "@/lib/moduleRegistry";

export function MainLayout() {
  const [windows, setWindows] = useAtom(windowsAtom);

  const handleFileSelect = (item: any) => {
      if (item.type === "file") {
          // Map file names to module IDs (simple mapping for now)
          const moduleId = item.name.split('.')[0].toLowerCase();
          
          setWindows((prev: any[]) => {
            if (prev.find((w: any) => w.id === moduleId)) return prev;
            
            // Import dynamically to avoid circular deps if needed, but for now use registry
            // We need to ensure we have a way to get component by ID.
            // Since we can't easily import getModuleComponent inside this function without it being available in scope,
            // we'll assume the registry logic is handled or we import it at top level.
            // Let's rely on the fact we can import it.
            
            return [...prev, {
                id: moduleId,
                title: moduleId.toUpperCase(),
                component: getModuleComponent(moduleId),
                isOpen: true,
                isMinimized: false,
                position: { x: 150 + prev.length * 20, y: 150 + prev.length * 20 },
            }];
        });
      }
  };

  return (
    <>
      <div className="h-full w-full bg-background text-foreground font-mono overflow-hidden flex flex-col relative">
        {/* Wallpaper Background */}
        <div 
            className="absolute inset-0 z-0 bg-cover bg-center opacity-40 pointer-events-none"
            style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop")' }}
        />
        
        {/* Top Bar */}
        <div className="h-8 border-b flex items-center px-4 text-xs select-none bg-background/60 backdrop-blur-md z-10 relative border-white/10">
          <span className="font-bold mr-4">AnuragOS</span>
          <span className="flex-1 text-center text-muted-foreground">SYSTEM READY</span>
          <div className="flex gap-2 items-center">
             <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
             <span className="text-[10px] text-muted-foreground">ONLINE</span>
          </div>
        </div>

        <ResizablePanelGroup direction="horizontal" className="flex-1 z-10 relative">
          <ResizablePanel defaultSize={25} minSize={15} maxSize={40} className="flex flex-col border-r border-white/10 bg-background/40 backdrop-blur-sm">
             <div className="p-2 text-xs font-bold border-b border-white/10 bg-white/5 uppercase tracking-wider text-muted-foreground">Explorer</div>

             <ScrollArea className="flex-1">
               <div className="p-2">
                 <FolderTree items={initialFileSystem} onSelect={handleFileSelect} />
               </div>
             </ScrollArea>
          </ResizablePanel>
          
          <ResizableHandle withHandle className="bg-white/10" />
          
          <ResizablePanel defaultSize={75}>
              <div className="h-full flex flex-col bg-black/20 backdrop-blur-sm">
                  <CLI />
              </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
      <WindowManager />
    </>
  );
}
