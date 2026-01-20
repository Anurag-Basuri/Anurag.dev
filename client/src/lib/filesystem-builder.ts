import type { FileSystemItem } from '@/types/file-system';
import { getModuleTitle, type AppModuleId } from '@/lib/moduleRegistry';

// Helper to sanitize paths
const joinPath = (parent: string, child: string) => {
	const p = parent.endsWith('/') ? parent.slice(0, -1) : parent;
	const c = child.startsWith('/') ? child.slice(1) : child;
	return `${p}/${c}`;
};

export const FileSystemBuilder = {
	// Creates a folder with children, handling ID prefixing automatically.
	folder: (
		name: string,
		id: string,
		children: (FileSystemItem | ((parentId: string) => FileSystemItem))[] = [],
	): FileSystemItem => {
		// Resolve children, passing the current folder ID as context if they are functions
		const resolvedChildren = children.map(child =>
			typeof child === 'function' ? child(id) : child,
		);

		return {
			name,
			type: 'folder',
			id,
			children: resolvedChildren,
		};
	},

	// Creates a simple file.
	file: (name: string, content: string = ''): ((parentId: string) => FileSystemItem) => {
		return (parentId: string) => ({
			name,
			type: 'file',
			id: joinPath(parentId, name.toLowerCase().replace(/\./g, '_')), // Auto-generate ID from parent + name
			content,
		});
	},

	// Creates an executable app shortcut.
	app: (
		moduleId: AppModuleId,
		overrides?: Partial<FileSystemItem>,
	): ((parentId: string) => FileSystemItem) => {
		return (parentId: string) => {
			const title = getModuleTitle(moduleId); // e.g. "Projects"
			const baseName = overrides?.name || `${moduleId}.app`; // projects.app

			return {
				name: baseName,
				type: 'file',
				id: joinPath(parentId, moduleId), // e.g. "work/projects"
				moduleId,
				content: `[Executable App] Run to launch ${title}.`,
				...overrides,
			};
		};
	},
};
