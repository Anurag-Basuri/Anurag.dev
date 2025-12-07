export type FileSystemItem = {
	name: string;
	type: 'folder' | 'file';
	children?: FileSystemItem[];
	id: string;
	icon?: string;
	metadata?: any;
};
