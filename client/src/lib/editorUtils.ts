import {
	FileJson,
	FileCode,
	FileText,
	FileImage,
	FileSpreadsheet,
	File as FileGeneric,
	Terminal,
	type LucideIcon,
} from 'lucide-react';

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
			return Terminal;
		default:
			return FileGeneric;
	}
}
