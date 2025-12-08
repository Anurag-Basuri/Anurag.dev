import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { WindowState } from '@/types/window';

export const bootCompleteAtom = atom(false);

// Persist window state in localStorage
export const windowsAtom = atomWithStorage<WindowState[]>('windows', []);
export const windowStackAtom = atomWithStorage<string[]>('window-stack', []);

export const activeWindowIdAtom = atom<string | null>(null);
