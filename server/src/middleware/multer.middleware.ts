import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import os from 'os';
import { Request } from 'express';
import { ApiError } from '../utils/ApiError';

// Allowed MIME types for each category and combined set for "any" uploads
const IMAGE_TYPES = new Set([
	'image/jpeg',
	'image/jpg',
	'image/png',
	'image/gif',
	'image/webp',
	'image/svg+xml',
]);

const VIDEO_TYPES = new Set(['video/mp4', 'video/webm', 'video/quicktime']);

const DOCUMENT_TYPES = new Set([
	'application/pdf',
	'application/msword',
	'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const ALL_ALLOWED_TYPES = new Set([...IMAGE_TYPES, ...VIDEO_TYPES, ...DOCUMENT_TYPES]);
const MEDIA_TYPES = new Set([...IMAGE_TYPES, ...DOCUMENT_TYPES]);

// Size limits for each category (in bytes)
const FILE_SIZE_LIMITS = {
	image: 10 * 1024 * 1024, // 10 MB
	video: 50 * 1024 * 1024, // 50 MB
	document: 10 * 1024 * 1024, // 10 MB
} as const;

type FileCategory = keyof typeof FILE_SIZE_LIMITS;

function getFileCategory(mimetype: string): FileCategory {
	if (IMAGE_TYPES.has(mimetype)) return 'image';
	if (VIDEO_TYPES.has(mimetype)) return 'video';
	return 'document';
}

// Storage configuration: save to temp directory with unique filenames
const storage = multer.diskStorage({
	destination: os.tmpdir(),
	filename: (_req, file, cb) => {
		const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		const ext = path.extname(file.originalname).toLowerCase();
		cb(null, `${unique}${ext}`);
	},
});

// File filter factory to validate MIME types based on allowed sets
function fileFilter(allowedTypes: Set<string>) {
	return (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
		if (allowedTypes.has(file.mimetype)) {
			cb(null, true);
		} else {
			cb(
				ApiError.BadRequest(
					`File type "${file.mimetype}" is not allowed. Accepted: ${[...allowedTypes].join(', ')}`,
				),
			);
		}
	};
}

// Multer Instances

// Accept images only (jpg, png, gif, webp, svg) — max 10 MB``
const imageUpload = multer({
	storage,
	limits: { fileSize: FILE_SIZE_LIMITS.image },
	fileFilter: fileFilter(IMAGE_TYPES),
});

// Accept videos only (mp4, webm, mov) — max 50 MB
const videoUpload = multer({
	storage,
	limits: { fileSize: FILE_SIZE_LIMITS.video },
	fileFilter: fileFilter(VIDEO_TYPES),
});

// Accept documents only (pdf, doc, docx) — max 10 MB
const documentUpload = multer({
	storage,
	limits: { fileSize: FILE_SIZE_LIMITS.document },
	fileFilter: fileFilter(DOCUMENT_TYPES),
});

// Accept any allowed file type — uses largest size limit; cloudinary.ts validates further
const anyUpload = multer({
	storage,
	limits: { fileSize: FILE_SIZE_LIMITS.video },
	fileFilter: fileFilter(ALL_ALLOWED_TYPES),
});

// Accept images + documents (no video) — max 10 MB
const mediaUpload = multer({
	storage,
	limits: { fileSize: FILE_SIZE_LIMITS.document },
	fileFilter: fileFilter(MEDIA_TYPES),
});

export { imageUpload, videoUpload, documentUpload, anyUpload, mediaUpload, getFileCategory };
