export type ReadmeDocMeta = {
	sizeBytes: number;
	lastModified: string;
	lines: number;
	words: number;
};

export type TocItem = {
	depth: 1 | 2 | 3;
	text: string;
	id: string;
};

