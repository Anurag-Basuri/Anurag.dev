import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { env } from '../../config/env';
import { unauthorized } from '../../lib/errors';

// ─── Types ────────────────────────────────────────────────────────

export interface TokenPayload {
	adminId: string;
	username: string;
}

export interface AuthTokens {
	accessToken: string;
	refreshToken: string;
	expiresIn: string;
}

// ─── Password Hashing ─────────────────────────────────────────────

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
	return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
	return bcrypt.compare(plain, hash);
}

// ─── JWT Tokens ───────────────────────────────────────────────────

export function generateAccessToken(payload: TokenPayload): string {
	const tokenPayload = { adminId: payload.adminId, username: payload.username };
	return jwt.sign(tokenPayload, env.JWT_SECRET, {
		expiresIn: env.JWT_ACCESS_EXPIRY as string,
	} as jwt.SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload | null {
	try {
		const decoded = jwt.verify(token, env.JWT_SECRET) as jwt.JwtPayload & TokenPayload;
		return { adminId: decoded.adminId, username: decoded.username };
	} catch {
		return null;
	}
}

function generateRefreshTokenString(payload: TokenPayload): string {
	const tokenPayload = { adminId: payload.adminId, username: payload.username };
	return jwt.sign(tokenPayload, env.JWT_REFRESH_SECRET, {
		expiresIn: env.JWT_REFRESH_EXPIRY as string,
	} as jwt.SignOptions);
}

function verifyRefreshTokenString(token: string): TokenPayload | null {
	try {
		const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as jwt.JwtPayload & TokenPayload;
		return { adminId: decoded.adminId, username: decoded.username };
	} catch {
		return null;
	}
}

// ─── Token Management ─────────────────────────────────────────────

/**
 * Parse a duration string like "7d", "15m", "1h" into milliseconds.
 */
function parseDuration(duration: string): number {
	const match = duration.match(/^(\d+)([smhd])$/);
	if (!match) return 7 * 24 * 60 * 60 * 1000;

	const value = parseInt(match[1], 10);
	const unit = match[2];

	switch (unit) {
		case 's':
			return value * 1000;
		case 'm':
			return value * 60 * 1000;
		case 'h':
			return value * 60 * 60 * 1000;
		case 'd':
			return value * 24 * 60 * 60 * 1000;
		default:
			return 7 * 24 * 60 * 60 * 1000;
	}
}

/**
 * Generates an access + refresh token pair.
 * Stores the refresh token in the database.
 */
export async function generateTokenPair(payload: TokenPayload): Promise<AuthTokens> {
	const accessToken = generateAccessToken(payload);
	const refreshTokenStr = generateRefreshTokenString(payload);

	const expiresAt = new Date(Date.now() + parseDuration(env.JWT_REFRESH_EXPIRY));

	await prisma.refreshToken.create({
		data: {
			token: refreshTokenStr,
			adminId: payload.adminId,
			expiresAt,
		},
	});

	return {
		accessToken,
		refreshToken: refreshTokenStr,
		expiresIn: env.JWT_ACCESS_EXPIRY,
	};
}

/**
 * Rotates a refresh token: revokes the old one, issues a new pair.
 * Throws if the token is invalid, expired, or already revoked.
 */
export async function rotateRefreshToken(oldToken: string): Promise<AuthTokens> {
	const payload = verifyRefreshTokenString(oldToken);
	if (!payload) {
		throw unauthorized('Invalid refresh token');
	}

	const stored = await prisma.refreshToken.findUnique({
		where: { token: oldToken },
	});

	if (!stored || stored.revokedAt !== null || stored.expiresAt < new Date()) {
		if (stored && stored.revokedAt !== null) {
			await prisma.refreshToken.updateMany({
				where: { adminId: stored.adminId },
				data: { revokedAt: new Date() },
			});
		}
		throw unauthorized('Refresh token expired or revoked');
	}

	await prisma.refreshToken.update({
		where: { id: stored.id },
		data: { revokedAt: new Date() },
	});

	return generateTokenPair({
		adminId: payload.adminId,
		username: payload.username,
	});
}

/**
 * Revokes a specific refresh token (logout).
 */
export async function revokeRefreshToken(token: string): Promise<void> {
	await prisma.refreshToken.updateMany({
		where: { token, revokedAt: null },
		data: { revokedAt: new Date() },
	});
}
