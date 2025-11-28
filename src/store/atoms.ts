import { atom } from 'jotai';
import { ReactNode } from 'react';

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

