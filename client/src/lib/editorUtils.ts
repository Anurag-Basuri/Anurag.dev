import {
	FileJson,
	FileCode,
	FileText,
	FileType,
	FileImage,
	FileSpreadsheet,
	FileDigit,
	File as FileGeneric,
	Terminal,
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export function getFileIcon(filename: string): LucideIcon {
	const ext = filename.split('.').pop()?.toLowerCase();
	switch (ext) {
		case 'json':
			return FileJson;
		case 'tsx':
		case 'jsx':
		case 'ts':
		case 'js':
		case 'py':
		case 'java':
		case 'c':
		case 'cpp':
			return FileCode;
		case 'css':
		case 'scss':
		case 'html':
			return FileCode;
		case 'md':
		case 'txt':
		case 'log':
			return FileText;
		case 'png':
		case 'jpg':
		case 'jpeg':
		case 'svg':
			return FileImage;
		case 'csv':
		case 'xlsx':
			return FileSpreadsheet;
		case 'exe':
			return Terminal; // Or a binary icon if available
		default:
			return FileGeneric;
	}
}

export function getLanguage(filename: string): string {
	const ext = filename.split('.').pop()?.toLowerCase();
	switch (ext) {
		case 'json':
			return 'JSON';
		case 'tsx':
			return 'TypeScript React';
		case 'jsx':
			return 'JavaScript React';
		case 'ts':
			return 'TypeScript';
		case 'js':
			return 'JavaScript';
		case 'py':
			return 'Python';
		case 'css':
			return 'CSS';
		case 'html':
			return 'HTML';
		case 'md':
			return 'Markdown';
		case 'txt':
			return 'Plain Text';
		case 'log':
			return 'Log File';
		case 'exe':
			return 'Binary';
		default:
			return 'Plain Text';
	}
}

export function getBranchName(): string {
	return 'main'; // Keep it simple for now
}
