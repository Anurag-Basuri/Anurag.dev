import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';

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

// ─── Constants ────────────────────────────────────────────────────

const ADMIN_ID = 'admin';

// ─── Password Verification ───────────────────────────────────────

export async function verifyPassword(plain: string): Promise<boolean> {
	return bcrypt.compare(plain, env.ADMIN_PASSWORD_HASH);
}

// ─── JWT Tokens ───────────────────────────────────────────────────

export function generateAccessToken(payload: TokenPayload): string {
	return jwt.sign(
		{ adminId: payload.adminId, username: payload.username },
		env.JWT_SECRET,
		{ expiresIn: env.JWT_ACCESS_EXPIRY as string } as jwt.SignOptions,
	);
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
	return jwt.sign(
		{ adminId: payload.adminId, username: payload.username },
		env.JWT_REFRESH_SECRET,
		{ expiresIn: env.JWT_REFRESH_EXPIRY as string } as jwt.SignOptions,
	);
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

export function generateTokenPair(payload: TokenPayload): AuthTokens {
	return {
		accessToken: generateAccessToken(payload),
		refreshToken: generateRefreshTokenString(payload),
		expiresIn: env.JWT_ACCESS_EXPIRY,
	};
}

export async function login(username: string, password: string): Promise<AuthTokens> {
	if (username !== env.ADMIN_USERNAME) {
		throw ApiError.Unauthorized('Invalid username or password');
	}

	const valid = await verifyPassword(password);
	if (!valid) {
		throw ApiError.Unauthorized('Invalid username or password');
	}

	return generateTokenPair({ adminId: ADMIN_ID, username });
}

export function rotateRefreshToken(oldToken: string): AuthTokens {
	const payload = verifyRefreshTokenString(oldToken);
	if (!payload) {
		throw ApiError.Unauthorized('Invalid or expired refresh token');
	}

	return generateTokenPair(payload);
}

export function getAdminInfo(payload: TokenPayload) {
	return {
		adminId: payload.adminId,
		username: payload.username,
	};
}
