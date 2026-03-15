import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { logAudit } from '../lib/audit';
import { uploadFile, uploadResume, deleteFile } from '../lib/cloudinary';

const SINGLETON_ID = 'main';

async function getProfile(_req: Request, res: Response): Promise<void> {
	const profile = await prisma.profile.findUnique({ where: { id: SINGLETON_ID } });
	ApiResponse.ok(res, profile ?? null);
}

async function updateProfile(req: Request, res: Response): Promise<void> {
	const data = req.body;
	const adminId = req.admin!.adminId;

	const profile = await prisma.profile.upsert({
		where: { id: SINGLETON_ID },
		create: { id: SINGLETON_ID, ...data },
		update: data,
	});

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'Profile',
		resourceId: SINGLETON_ID,
		changes: data,
	});

	ApiResponse.ok(res, profile, 'Profile updated');
}

// Upload avatar image
async function uploadAvatar(req: Request, res: Response): Promise<void> {
	if (!req.file) throw ApiError.BadRequest('No file provided');
	const adminId = req.admin!.adminId;

	const result = await uploadFile(req.file, { folder: 'portfolio/avatars' });

	const existing = await prisma.profile.findUnique({ where: { id: SINGLETON_ID } });
	if (existing?.avatarUrl) {
		try {
			const publicId = extractPublicId(existing.avatarUrl);
			if (publicId) await deleteFile({ publicId, resourceType: 'image' });
		} catch {
			// Old file cleanup is non-critical
		}
	}

	const profile = await prisma.profile.upsert({
		where: { id: SINGLETON_ID },
		create: { id: SINGLETON_ID, avatarUrl: result.url },
		update: { avatarUrl: result.url },
	});

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'Profile',
		resourceId: SINGLETON_ID,
		changes: { avatarUrl: result.url },
	});

	ApiResponse.ok(res, profile, 'Avatar uploaded');
}

// Upload cover image
async function uploadCover(req: Request, res: Response): Promise<void> {
	if (!req.file) throw ApiError.BadRequest('No file provided');
	const adminId = req.admin!.adminId;

	const result = await uploadFile(req.file, { folder: 'portfolio/covers' });

	const existing = await prisma.profile.findUnique({ where: { id: SINGLETON_ID } });
	if (existing?.coverUrl) {
		try {
			const publicId = extractPublicId(existing.coverUrl);
			if (publicId) await deleteFile({ publicId, resourceType: 'image' });
		} catch {
			// Old file cleanup is non-critical
		}
	}

	const profile = await prisma.profile.upsert({
		where: { id: SINGLETON_ID },
		create: { id: SINGLETON_ID, coverUrl: result.url },
		update: { coverUrl: result.url },
	});

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'Profile',
		resourceId: SINGLETON_ID,
		changes: { coverUrl: result.url },
	});

	ApiResponse.ok(res, profile, 'Cover image uploaded');
}

// Upload resume document
async function uploadResumeFile(req: Request, res: Response): Promise<void> {
	if (!req.file) throw ApiError.BadRequest('No file provided');
	const adminId = req.admin!.adminId;

	const result = await uploadResume(req.file);

	const existing = await prisma.profile.findUnique({ where: { id: SINGLETON_ID } });
	if (existing?.resumeUrl) {
		try {
			const publicId = extractPublicId(existing.resumeUrl);
			if (publicId) await deleteFile({ publicId, resourceType: 'raw' });
		} catch {
			// Old file cleanup is non-critical
		}
	}

	const profile = await prisma.profile.upsert({
		where: { id: SINGLETON_ID },
		create: { id: SINGLETON_ID, resumeUrl: result.url },
		update: { resumeUrl: result.url },
	});

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'Profile',
		resourceId: SINGLETON_ID,
		changes: { resumeUrl: result.url },
	});

	ApiResponse.ok(res, profile, 'Resume uploaded');
}

function extractPublicId(url: string): string | null {
	try {
		const parts = new URL(url).pathname.split('/');
		const uploadIndex = parts.indexOf('upload');
		if (uploadIndex === -1) return null;
		const relevant = parts.slice(uploadIndex + 2).join('/');
		return relevant.replace(/\.[^.]+$/, '');
	} catch {
		return null;
	}
}

export { getProfile, updateProfile, uploadAvatar, uploadCover, uploadResumeFile };
