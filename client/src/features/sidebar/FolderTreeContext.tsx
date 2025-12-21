import { createContext, useContext } from 'react';
import type { FileSystemItem } from '@/types/file-system';

interface FolderTreeContextValue {
	expandedFolders: Set<string>;
	setExpandedFolders: React.Dispatch<React.SetStateAction<Set<string>>>;
	focusedId: string | null;
	setFocusedId: (id: string | null) => void;
	activeModuleId: string | null;
	onSelect?: (item: FileSystemItem) => void;
}

export const FolderTreeContext = createContext<FolderTreeContextValue | null>(null);

export function useFolderTreeContext() {
	const context = useContext(FolderTreeContext);
	if (!context) {
		throw new Error('useFolderTreeContext must be used within FolderTreeProvider');
	}
	return context;
}
