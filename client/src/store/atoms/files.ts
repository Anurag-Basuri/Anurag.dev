import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

export interface OpenFile {
	moduleId: string;
	openedAt: number;
}

// Constants for default behavior
const DEFAULT_MODULE_ID = 'about' as const;
const STORAGE_KEY = 'open-files' as const;

// Helper function to create a file entry
export const createFileEntry = (moduleId: string): OpenFile => ({
	moduleId,
	openedAt: Date.now(),
});

// Helper function for default initial state
const getDefaultOpenFiles = (): OpenFile[] => [];

/**
 * SSR-safe storage that only uses localStorage on the client.
 * During SSR, it returns the default value without errors.
 */
const storage = createJSONStorage<OpenFile[]>(() => {
	if (typeof window === 'undefined') {
		// Return a no-op storage for SSR
		return {
			getItem: () => null,
			setItem: () => {},
			removeItem: () => {},
		};
	}
	return localStorage;
});

/**
 * Atom to track currently open files in the application.
 * Persists to localStorage with proper SSR safety.
 */
export const openFilesAtom = atomWithStorage<OpenFile[]>(
	STORAGE_KEY,
	getDefaultOpenFiles(),
	storage,
	{ getOnInit: true },
);

// Export constants for use in other modules
export { DEFAULT_MODULE_ID };
