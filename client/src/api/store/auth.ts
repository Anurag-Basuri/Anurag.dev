import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// Persisted token atoms (survive page refresh via localStorage)
export const accessTokenAtom = atomWithStorage<string | null>('portfolio_access_token', null);
export const refreshTokenAtom = atomWithStorage<string | null>('portfolio_refresh_token', null);

// Derived atom — true if access token exists
export const isAuthenticatedAtom = atom((get) => get(accessTokenAtom) !== null);
