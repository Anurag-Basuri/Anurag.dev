import type { ReadmeData } from '../schema';

export const FALLBACK_README: ReadmeData = {
	content: `# System Initialization Failed\n\n> **WARNING:** The connection to the backend system document provider was lost or blocked. \n\nThis is a standard fallback document injected by the \`publicService\` protection layer to prevent a hard fault. Please verify the API server is actively streaming on the correct origin port.\n\n### Error Code\n\`ERR_CONNECTION_REFUSED - /api/v1/docs/readme\``,
	metadata: {
		sizeBytes: 420,
		lastModified: new Date().toISOString(),
		lines: 7,
		words: 45,
	},
};
