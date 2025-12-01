"use client";

import React, { useState } from "react";
import { FileSystemItem } from "@/lib/data";
import {
  Folder,
  FolderOpen,
  File,
  ChevronRight,
  ChevronDown,
  FileCode,
  FileJson,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSetAtom } from "jotai";
import { activeTabIdAtom, tabsAtom, Tab } from "@/store/atoms";
import { ScrollArea } from "../ui/scroll-area";

interface FolderTreeProps {
  items: FileSystemItem[];
  level?: number;
  onSelect?: (item: FileSystemItem) => void;
}

const FileIcon = ({ name }: { name: string }) => {
  if (name.endsWith(".json"))
    return <FileJson className="w-4 h-4 text-yellow-500" />;
  if (name.endsWith(".md") || name.endsWith(".txt"))
    return <FileText className="w-4 h-4 text-blue-400" />;
  if (name.endsWith(".py") || name.endsWith(".js") || name.endsWith(".tsx"))
    return <FileCode className="w-4 h-4 text-green-500" />;
  return <File className="w-4 h-4 text-zinc-500" />;
};

export function FolderTree({ items, level = 0, onSelect }: FolderTreeProps) {
  return (
    <div className="w-full">
      {items.map((item) => (
        <FolderTreeItem
          key={item.id}
          item={item}
          level={level}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function FolderTreeItem({
  item,
  level,
  onSelect,
}: {
  item: FileSystemItem;
  level: number;
  onSelect?: (item: FileSystemItem) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.type === "folder") {
      setIsOpen(!isOpen);
    }
    onSelect?.(item);
  };

  return (
    <div>
      <div
        className={cn(
          "flex items-center py-1 px-2 hover:bg-white/10 cursor-pointer select-none text-sm transition-colors rounded-sm",
          level > 0 && "ml-4"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleToggle}
      >
        <span className="mr-1 opacity-70">
          {item.type === "folder" &&
            (isOpen ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            ))}
          {item.type === "file" && <span className="w-3 h-3 inline-block" />}
        </span>

        <span className="mr-2">
          {item.type === "folder" ? (
            isOpen ? (
              <FolderOpen className="w-4 h-4 text-blue-500" />
            ) : (
              <Folder className="w-4 h-4 text-blue-500" />
            )
          ) : (
            <FileIcon name={item.name} />
          )}
        </span>

        <span
          className={cn("truncate", item.name === "secret" && "text-zinc-500")}
        >
          {item.name}
        </span>
      </div>

      {item.type === "folder" && isOpen && item.children && (
        <FolderTree
          items={item.children}
          level={level + 1}
          onSelect={onSelect}
        />
      )}
    </div>
  );
}

const FileItem = ({ name, id }: { name: string; id: string }) => {
  const setTabs = useSetAtom(tabsAtom);
  const setActiveTabId = useSetAtom(activeTabIdAtom);

  const handleClick = () => {
    setTabs((prevTabs) => {
      if (prevTabs.some((tab) => tab.id === id)) {
        return prevTabs;
      }
      const newTab: Tab = {
        id,
        title: name,
        type: "module",
      };
      return [...prevTabs, newTab];
    });
    setActiveTabId(id);
  };

  return (
    <div
      className="flex items-center space-x-2 cursor-pointer hover:bg-muted p-1 rounded"
      onClick={handleClick}
    >
      <File className="h-4 w-4 text-muted-foreground" />
      <span>{name}</span>
    </div>
  );
};
