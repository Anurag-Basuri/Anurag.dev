import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { logAudit } from '../lib/audit';
import { uploadFile, uploadResume, deleteFile, buildDeleteTarget } from '../lib/cloudinary';
import type { IdRequest } from '../utils/types';

const SINGLETON_ID = 'main';

function normalizeSocialLinkInput(data: { platform?: string; customLabel?: string }) {
	const platform =
		typeof data.platform === 'string' ? data.platform.trim().toUpperCase() : data.platform;
	const customLabel =
		typeof data.customLabel === 'string' ? data.customLabel.trim() : data.customLabel;

	if (!platform) {
		throw ApiError.BadRequest('platform is required');
	}

	if (platform === 'OTHER' && !customLabel) {
		throw ApiError.BadRequest('customLabel is required when platform is OTHER');
	}

	return {
		platform: platform as any,
		customLabel: platform === 'OTHER' ? customLabel : null,
	};
}

async function getProfile(_req: Request, res: Response): Promise<void> {
	const profile = await prisma.profile.findUnique({
		where: { id: SINGLETON_ID },
		include: { socialLinks: true },
	});
	ApiResponse.ok(res, profile ?? null);
}

async function updateProfile(req: Request, res: Response): Promise<void> {
	const data = req.body;
	const adminId = req.admin!.adminId;

	const profile = await prisma.profile.upsert({
		where: { id: SINGLETON_ID },
		create: { id: SINGLETON_ID, ...data },
		update: data,
		include: { socialLinks: true },
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

// Social links
async function listSocialLinks(_req: Request, res: Response): Promise<void> {
	const links = await prisma.socialLink.findMany({
		where: { profileId: SINGLETON_ID },
		orderBy: { createdAt: 'desc' },
	});
	ApiResponse.ok(res, links);
}

async function createSocialLink(req: Request, res: Response): Promise<void> {
	const data = req.body;
	const adminId = req.admin!.adminId;

	const normalized = normalizeSocialLinkInput(data);

	if (normalized.platform !== 'OTHER') {
		const existing = await prisma.socialLink.findFirst({
			where: { profileId: SINGLETON_ID, platform: normalized.platform },
		});
		if (existing)
			throw ApiError.Conflict(`Social link for ${normalized.platform} already exists`);
	}

	const link = await prisma.socialLink.create({
		data: { ...data, ...normalized, profileId: SINGLETON_ID },
	});

	await logAudit({
		adminId,
		action: 'create',
		resourceType: 'SocialLink',
		resourceId: link.id,
		changes: data,
	});

	ApiResponse.created(res, link);
}

async function updateSocialLink(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const data = req.body;
	const adminId = req.admin!.adminId;

	const existing = await prisma.socialLink.findUnique({ where: { id } });
	if (!existing || existing.profileId !== SINGLETON_ID) throw ApiError.NotFound('Social link');

	const normalized = data.platform || data.customLabel ? normalizeSocialLinkInput(data) : null;

	if (
		normalized?.platform &&
		normalized.platform !== existing.platform &&
		normalized.platform !== 'OTHER'
	) {
		const duplicate = await prisma.socialLink.findFirst({
			where: { profileId: SINGLETON_ID, platform: normalized.platform },
		});
		if (duplicate)
			throw ApiError.Conflict(`Social link for ${normalized.platform} already exists`);
	}

	const link = await prisma.socialLink.update({
		where: { id },
		data: { ...data, ...(normalized ?? {}) },
	});

	await logAudit({
		adminId,
		action: 'update',
		resourceType: 'SocialLink',
		resourceId: id,
		changes: data,
	});

	ApiResponse.ok(res, link, 'Social link updated');
}

async function deleteSocialLink(req: IdRequest, res: Response): Promise<void> {
	const { id } = req.params;
	const adminId = req.admin!.adminId;

	const existing = await prisma.socialLink.findUnique({ where: { id } });
	if (!existing || existing.profileId !== SINGLETON_ID) throw ApiError.NotFound('Social link');

	await prisma.socialLink.delete({ where: { id } });

	await logAudit({
		adminId,
		action: 'delete',
		resourceType: 'SocialLink',
		resourceId: id,
		changes: { platform: existing.platform, url: existing.url },
	});

	ApiResponse.noContent(res);
}

// Upload avatar image
async function uploadAvatar(req: Request, res: Response): Promise<void> {
	if (!req.file) throw ApiError.BadRequest('No file provided');
	const adminId = req.admin!.adminId;

	const result = await uploadFile(req.file, { folder: 'portfolio/avatars' });

	const existing = await prisma.profile.findUnique({ where: { id: SINGLETON_ID } });
	if (existing?.avatarUrl) {
		try {
			const target = buildDeleteTarget(existing.avatarUrl);
			if (target) await deleteFile(target);
		} catch {
			// Old file cleanup is non-critical
		}
	}

	const profile = await prisma.profile.upsert({
		where: { id: SINGLETON_ID },
		create: { id: SINGLETON_ID, avatarUrl: result.url },
		update: { avatarUrl: result.url },
		include: { socialLinks: true },
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
			const target = buildDeleteTarget(existing.coverUrl);
			if (target) await deleteFile(target);
		} catch {
			// Old file cleanup is non-critical
		}
	}

	const profile = await prisma.profile.upsert({
		where: { id: SINGLETON_ID },
		create: { id: SINGLETON_ID, coverUrl: result.url },
		update: { coverUrl: result.url },
		include: { socialLinks: true },
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
			const target = buildDeleteTarget(existing.resumeUrl);
			if (target) await deleteFile(target);
		} catch {
			// Old file cleanup is non-critical
		}
	}

	const profile = await prisma.profile.upsert({
		where: { id: SINGLETON_ID },
		create: { id: SINGLETON_ID, resumeUrl: result.url },
		update: { resumeUrl: result.url },
		include: { socialLinks: true },
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

export {
	getProfile,
	updateProfile,
	uploadAvatar,
	uploadCover,
	uploadResumeFile,
	listSocialLinks,
	createSocialLink,
	updateSocialLink,
	deleteSocialLink,
};
