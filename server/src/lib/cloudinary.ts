import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

// Types for uploads and deletions, plus config constants and helpers.
interface UploadedFile {
	path: string;
	mimetype: string;
	size: number;
	originalname?: string;
}

interface UploadResult {
	url: string;
	publicId: string;
	resourceType: string;
}

interface DeleteTarget {
	publicId: string;
	resourceType: 'image' | 'video' | 'raw';
}

interface UploadOptions {
	folder?: string;
}

// Allowed MIME types and max file size for uploads
const ALLOWED_MIME_TYPES: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/jpg': 'jpg',
	'image/png': 'png',
	'image/gif': 'gif',
	'image/webp': 'webp',
	'image/svg+xml': 'svg',
	'video/mp4': 'mp4',
	'video/webm': 'webm',
	'video/quicktime': 'mov',
	'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Initialization flag to ensure Cloudinary is configured once
let initialized = false;

function ensureInitialized(): void {
	if (initialized) return;

	cloudinary.config({
		cloud_name: env.CLOUDINARY_CLOUD_NAME,
		api_key: env.CLOUDINARY_API_KEY,
		api_secret: env.CLOUDINARY_API_SECRET,
		secure: true,
	});

	initialized = true;
}

// Ping Cloudinary to verify credentials and connectivity. Throws if ping fails.
async function verifyConnection(): Promise<void> {
	ensureInitialized();

	const response = await cloudinary.api.ping();
	if (response?.status !== 'ok') {
		throw new Error(`Cloudinary ping failed: ${response?.status ?? 'unknown'}`);
	}
}

// Validates the uploaded file's type and size against allowed criteria. Throws if invalid.
function validateFile(file: UploadedFile): void {
	if (!file?.mimetype || !(file.mimetype in ALLOWED_MIME_TYPES)) {
		throw ApiError.BadRequest(
			`Invalid file type "${file?.mimetype ?? 'unknown'}". Allowed: ${Object.keys(ALLOWED_MIME_TYPES).join(', ')}`,
		);
	}

	if (file.size > MAX_FILE_SIZE) {
		const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
		throw ApiError.BadRequest(
			`File size (${sizeMB} MB) exceeds the ${MAX_FILE_SIZE / (1024 * 1024)} MB limit`,
		);
	}
}

function cleanupLocalFile(filePath: string): void {
	try {
		fs.unlinkSync(filePath);
	} catch {
		console.warn(`[cloudinary] Failed to delete local file: ${filePath}`);
	}
}

function toUploadResult(response: UploadApiResponse): UploadResult {
	return {
		url: response.secure_url,
		publicId: response.public_id,
		resourceType: response.resource_type,
	};
}

// Upload Operations

// Upload File (image/video/raw based on mimetype)
async function uploadFile(file: UploadedFile, options: UploadOptions = {}): Promise<UploadResult> {
	validateFile(file);
	ensureInitialized();

	try {
		const response = await cloudinary.uploader.upload(file.path, {
			resource_type: 'auto',
			folder: options.folder,
			overwrite: true,
		});

		cleanupLocalFile(file.path);
		return toUploadResult(response);
	} catch (err) {
		cleanupLocalFile(file.path);
		const message = err instanceof Error ? err.message : String(err);
		throw ApiError.InternalServerError(`Failed to upload "${file.originalname ?? file.path}": ${message}`);
	}
}

// Upload Resume
async function uploadResume(file: UploadedFile): Promise<UploadResult> {
	validateFile(file);
	ensureInitialized();

	try {
		const response = await cloudinary.uploader.upload(file.path, {
			resource_type: 'raw',
			type: 'upload',
			folder: 'resumes',
			public_id: path.basename(file.originalname ?? 'resume'),
			overwrite: true,
		});

		cleanupLocalFile(file.path);
		return toUploadResult(response);
	} catch (err) {
		cleanupLocalFile(file.path);
		const message = err instanceof Error ? err.message : String(err);
		throw ApiError.InternalServerError(`Failed to upload resume: ${message}`);
	}
}

// Delete Operations

// Delete a single file
async function deleteFile(target: DeleteTarget): Promise<void> {
	if (!target.publicId || !target.resourceType) {
		throw ApiError.BadRequest('publicId and resourceType are required to delete a file');
	}

	ensureInitialized();

	try {
		const result = await cloudinary.uploader.destroy(target.publicId, {
			resource_type: target.resourceType,
		});

		if (result.result !== 'ok' && result.result !== 'not found') {
			throw ApiError.InternalServerError(`Cloudinary deletion failed for "${target.publicId}": ${result.result}`);
		}
	} catch (err) {
		if (err instanceof Error && 'statusCode' in err) throw err; // Re-throw AppError
		const message = err instanceof Error ? err.message : String(err);
		throw ApiError.InternalServerError(`Failed to delete "${target.publicId}": ${message}`);
	}
}

// Delete multiple files in bulk. Groups by resource type for efficiency.
async function deleteFiles(targets: DeleteTarget[]): Promise<void> {
	if (!targets.length) return;

	ensureInitialized();

	// Group public IDs by resource type for batch deletion
	const grouped = new Map<string, string[]>();
	for (const { publicId, resourceType } of targets) {
		const ids = grouped.get(resourceType) ?? [];
		ids.push(publicId);
		grouped.set(resourceType, ids);
	}

	try {
		for (const [resourceType, publicIds] of grouped) {
			await cloudinary.api.delete_resources(publicIds, { resource_type: resourceType });
		}
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		console.error(`[cloudinary] Bulk delete failed: ${message}`);
		throw ApiError.InternalServerError(`Failed to delete files in bulk: ${message}`);
	}
}

// Exports
export { verifyConnection, uploadFile, uploadResume, deleteFile, deleteFiles };
export type { UploadedFile, UploadResult, DeleteTarget, UploadOptions };
