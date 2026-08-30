import { atom } from 'jotai';

// Boot screen removed: default to true so it never renders
export const bootCompleteAtom = atom(true);
export const windowStateAtom = atom<'open' | 'minimized' | 'closed'>('open');
