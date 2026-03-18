import { atom } from 'jotai';

export const bootCompleteAtom = atom(false);
export const windowStateAtom = atom<'open' | 'minimized' | 'closed'>('open');
