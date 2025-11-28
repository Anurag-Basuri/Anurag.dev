"use client";

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MainLayout() {
  return (
    <div className="h-full w-full bg-background text-foreground font-mono overflow-hidden flex flex-col">
      {/* Top Bar */}
      <div className="h-8 border-b flex items-center px-4 text-xs select-none bg-muted/40">
        <span className="font-bold mr-4">AnuragOS</span>
        <span className="flex-1 text-center text-muted-foreground">SYSTEM READY</span>
        <div className="flex gap-2 items-center">
           <div className="w-2 h-2 rounded-full bg-green-500"></div>
           <span className="text-[10px] text-muted-foreground">ONLINE</span>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={35} minSize={20} maxSize={50} className="flex flex-col border-r">
           <div className="p-2 text-xs font-bold border-b bg-muted/20 uppercase tracking-wider text-muted-foreground">Explorer</div>
import { FolderTree } from "@/components/core/FolderTree";
import { initialFileSystem } from "@/lib/data";

// ... inside component
           <ScrollArea className="flex-1">
             <div className="p-2">
               <FolderTree items={initialFileSystem} />
             </div>
           </ScrollArea>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        <ResizablePanel defaultSize={65}>
            <div className="h-full flex flex-col">
                {/* CLI / Terminal Area */}
                <div className="flex-1 bg-zinc-950 text-green-500 p-4 font-mono text-sm overflow-auto">
                    <div className="mb-4">
                        <p>AnuragOS [Version 1.0.0]</p>
                        <p>(c) 2025 Anurag Basuri. All rights reserved.</p>
                        <br/>
                        <p>Type 'help' to view available commands.</p>
                    </div>
                    <div className="flex">
                        <span className="mr-2 text-blue-400">user@anurag:~$</span>
                        <span className="animate-pulse block w-2 h-4 bg-green-500"></span>
                    </div>
                </div>
            </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
