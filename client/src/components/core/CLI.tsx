"use client";

import React, { useState, useRef, useEffect } from "react";
import { processCommand, commandsList, CommandResponse } from "@/lib/commands";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAtom } from "jotai";
import { windowsAtom } from "@/store/atoms";
import { getModuleComponent } from "@/lib/moduleRegistry";

// Removed local moduleComponents definition in favor of registry


export function CLI() {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [windows, setWindows] = useAtom(windowsAtom);




  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      const response = processCommand(input);
      if (response.type === "clear") {
        setHistory([]);
      } else if (response.type === "open_module" && response.moduleId) {
         const newItem: HistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          command: input,
          response,
        };
        setHistory((prev) => [...prev, newItem]);
        
        // Open Window Logic
        const moduleId = response.moduleId;
        setWindows((prev) => {
            if (prev.find(w => w.id === moduleId)) return prev; // Already open
            return [...prev, {
                id: moduleId,
                title: moduleId.toUpperCase(),
                component: moduleComponents[moduleId] || <div className="p-4">Module not found</div>,
                isOpen: true,
                isMinimized: false,
                position: { x: 100 + prev.length * 20, y: 100 + prev.length * 20 },
            }];
        });
      } else {
        const newItem: HistoryItem = {
          id: Math.random().toString(36).substr(2, 9),
          command: input,
          response,
        };
        setHistory((prev) => [...prev, newItem]);
      }
      if (input.trim()) {
        setCmdHistory((prev) => [...prev, input]);
      }
      setInput("");
      setHistoryIndex(-1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (cmdHistory.length > 0) {
        const newIndex = historyIndex === -1 ? cmdHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(cmdHistory[newIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = Math.min(cmdHistory.length - 1, historyIndex + 1);
        if (historyIndex === cmdHistory.length - 1) {
            setHistoryIndex(-1);
            setInput("");
        } else {
            setHistoryIndex(newIndex);
            setInput(cmdHistory[newIndex]);
        }
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const match = commandsList.find((cmd) => cmd.startsWith(input.toLowerCase()));
      if (match) {
        setInput(match);
      }
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  // Focus input on click anywhere in CLI
  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-green-500 font-mono text-sm p-4 overflow-hidden" onClick={handleContainerClick}>
      <div className="mb-4 select-none">
        <p>AnuragOS [Version 1.0.0]</p>
        <p>(c) 2025 Anurag Basuri. All rights reserved.</p>
        <br />
        <p>Type 'help' to view available commands.</p>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="pb-4">
            {history.map((item) => (
            <div key={item.id} className="mb-2">
                <div className="flex">
                <span className="mr-2 text-blue-400">user@anurag:~$</span>
                <span>{item.command}</span>
                </div>
                <div className={cn("mt-1 whitespace-pre-wrap", item.response.type === "error" && "text-red-400")}>
                {item.response.content}
                </div>
            </div>
            ))}
            
            <div className="flex items-center">
            <span className="mr-2 text-blue-400">user@anurag:~$</span>
            <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-green-500 placeholder-green-500/30"
                autoFocus
                spellCheck={false}
                autoComplete="off"
            />
            </div>
            <div ref={scrollRef} />
        </div>
      </ScrollArea>
    </div>
  );
}
