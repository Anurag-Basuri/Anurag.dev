import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';
import { badRequest, internal } from './errors';

// ─── Types ────────────────────────────────────────────────────────

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

// ─── Config ───────────────────────────────────────────────────────

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
};

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// ─── Initialization ───────────────────────────────────────────────

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

/**
 * Verify Cloudinary credentials are valid by pinging the API.
 * Call once at server startup.
 */
async function verifyConnection(): Promise<void> {
	ensureInitialized();

	const response = await cloudinary.api.ping();
	if (response?.status !== 'ok') {
		throw new Error(`Cloudinary ping failed: ${response?.status ?? 'unknown'}`);
	}
}

// ─── Helpers ──────────────────────────────────────────────────────

function validateFile(file: UploadedFile): void {
	if (!file?.mimetype || !(file.mimetype in ALLOWED_MIME_TYPES)) {
		throw badRequest(
			`Invalid file type "${file?.mimetype ?? 'unknown'}". Allowed: ${Object.keys(ALLOWED_MIME_TYPES).join(', ')}`,
		);
	}

	if (file.size > MAX_FILE_SIZE) {
		const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
		throw badRequest(
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

// ─── Upload Operations ───────────────────────────────────────────

/**
 * Upload a file (image/video) to Cloudinary.
 * Validates type + size, uploads, cleans up local temp file.
 */
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
		throw internal(`Failed to upload "${file.originalname ?? file.path}": ${message}`);
	}
}

/**
 * Upload a resume (PDF) to Cloudinary under the "resumes" folder.
 * Uses raw resource type to preserve file format.
 */
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
		throw internal(`Failed to upload resume: ${message}`);
	}
}

// ─── Delete Operations ───────────────────────────────────────────

/**
 * Delete a single file from Cloudinary by public ID.
 */
async function deleteFile(target: DeleteTarget): Promise<void> {
	if (!target.publicId || !target.resourceType) {
		throw badRequest('publicId and resourceType are required to delete a file');
	}

	ensureInitialized();

	try {
		const result = await cloudinary.uploader.destroy(target.publicId, {
			resource_type: target.resourceType,
		});

		if (result.result !== 'ok' && result.result !== 'not found') {
			throw internal(`Cloudinary deletion failed for "${target.publicId}": ${result.result}`);
		}
	} catch (err) {
		if (err instanceof Error && 'statusCode' in err) throw err; // Re-throw AppError
		const message = err instanceof Error ? err.message : String(err);
		throw internal(`Failed to delete "${target.publicId}": ${message}`);
	}
}

/**
 * Bulk delete files from Cloudinary. Groups by resource type for efficiency.
 * Non-throwing — logs errors but doesn't interrupt the caller.
 */
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
	}
}

// ─── Exports ──────────────────────────────────────────────────────

export { verifyConnection, uploadFile, uploadResume, deleteFile, deleteFiles };
export type { UploadedFile, UploadResult, DeleteTarget, UploadOptions };
