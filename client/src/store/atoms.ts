import { atom } from "jotai";
import { ReactNode } from "react";

export const bootCompleteAtom = atom(false);

export type WindowState = {
  id: string;
  title: string;
  component: ReactNode; // We might need to store component name instead if not serializable, but for client-side it's ok
  isOpen: boolean;
  isMinimized: boolean;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
};

export const windowsAtom = atom<WindowState[]>([]);
export const activeWindowIdAtom = atom<string | null>(null);

export interface Tab {
  id: string;
  title: string;
  type: "module" | "cli";
}

// Holds the list of all open tabs. Starts with the CLI.
export const tabsAtom = atom<Tab[]>([
  { id: "cli", title: "Terminal", type: "cli" },
]);

// Holds the ID of the currently active tab.
export const activeTabIdAtom = atom<string>("cli");

// Derived atom to get the active tab object
export const activeTabAtom = atom((get) => {
  const tabs = get(tabsAtom);
  const activeId = get(activeTabIdAtom);
  return tabs.find((tab) => tab.id === activeId);
});
