import { ReactNode } from "react";
import { Setter } from "jotai";

import { Tab, tabsAtom, activeTabIdAtom } from "@/store/atoms";
import { moduleRegistry } from "./moduleRegistry";

export type CommandResponse = {
  type: "text" | "error" | "success" | "component" | "clear" | "open_module";
  content: string | ReactNode;
  moduleId?: string;
};

export const commandsList = [
  "help",
  "ls",
  "cd",
  "open",
  "about",
  "projects",
  "journey",
  "ai-lab",
  "blog",
  "contact",
  "clear",
  "exit",
];

export function processCommand(input: string): CommandResponse {
  const trimmed = input.trim();
  if (!trimmed) return { type: "text", content: "" };

  const [cmd, ...args] = trimmed.split(/\s+/);
  const command = cmd.toLowerCase();

  switch (command) {
    case "help":
      return {
        type: "text",
        content: `Available commands:
  help      - Show this help message
  ls        - List directory contents
  cd        - Change directory
  open      - Open a file or module
  about     - Open About module
  projects  - Open Projects Hub
  journey   - Open Journey Mode
  ai-lab    - Open AI Lab
  blog      - List blog posts
  contact   - Open Contact form
  clear     - Clear terminal
  exit      - End session`,
      };
    case "clear":
      return { type: "clear", content: "" };
    case "ls":
      // TODO: Implement actual directory listing based on current path
      return {
        type: "text",
        content:
          "about  projects  journey  ai-lab  blog  contact  tools  secret",
      };
    case "about":
    case "projects":
    case "journey":
    case "ai-lab":
    case "blog":
    case "contact":
      return {
        type: "open_module",
        content: `Opening ${command}...`,
        moduleId: command,
      };
    default:
      return {
        type: "error",
        content: `Command not found: ${command}. Type 'help' for available commands.`,
      };
  }
}

const open = (args: string[], set: Setter): string => {
  if (args.length === 0) {
    return "Usage: open [module_name]";
  }
  const moduleId = args[0].toLowerCase();

  if (!moduleRegistry[moduleId]) {
    return `Error: Module '${moduleId}' not found.`;
  }

  set(tabsAtom, (prevTabs) => {
    // If tab already exists, don't add it again
    if (prevTabs.some((tab) => tab.id === moduleId)) {
      return prevTabs;
    }
    const newTab: Tab = {
      id: moduleId,
      title: moduleId.charAt(0).toUpperCase() + moduleId.slice(1),
      type: "module",
    };
    return [...prevTabs, newTab];
  });

  // Switch to the newly opened or existing tab
  set(activeTabIdAtom, moduleId);

  return `Opening ${moduleId}...`;
};
