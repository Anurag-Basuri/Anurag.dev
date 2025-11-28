import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/db";
import { env } from "../../config/env";
import { userRepository } from "./user.repository";
import { AuthTokens, TokenPayload } from "../../types";

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRY,
  });
}

export function signRefreshToken(payload: { userId: string }): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRY,
  });
}

export function verifyAccessToken(token: string): TokenPayload | null {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as TokenPayload;
    return payload;
  } catch (error) {
    return null;
  }
}

export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
    return payload;
  } catch (error) {
    return null;
  }
}

export async function loginUser(username: string, password: string): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; username: string; email: string };
} | null> {
  const user = await userRepository.findByUsername(username);
  if (!user) return null;

  // Check if account is locked
  const isLocked = await userRepository.isAccountLocked(user.id);
  if (isLocked) {
    throw new Error('ACCOUNT_LOCKED');
  }

  // Verify password
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) {
    // Track failed login attempt
    await userRepository.trackFailedLogin(user.id);
    return null;
  }

  // Reset failed attempts on successful login
  await userRepository.resetFailedAttempts(user.id);

  const accessToken = signAccessToken({
    userId: user.id,
    username: user.username,
  });
  const refreshToken = signRefreshToken({ userId: user.id });

  // Persist refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, username: user.username, email: user.email },
  };
}

export async function rotateRefreshToken(oldToken: string): Promise<AuthTokens | null> {
  const payload = verifyRefreshToken(oldToken);
  if (!payload) return null;

  const stored = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
  });
  if (!stored || stored.isRevoked) return null;

  // Check if token has expired
  if (stored.expiresAt < new Date()) return null;

  // Revoke old token
  await prisma.refreshToken.update({
    where: { token: oldToken },
    data: { isRevoked: true },
  });

  // Get user info for access token
  const user = await userRepository.findById(payload.userId);
  if (!user) return null;

  // Issue new tokens
  const newRefreshToken = signRefreshToken({ userId: payload.userId });
  await prisma.refreshToken.create({
    data: {
      token: newRefreshToken,
      userId: payload.userId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  const accessToken = signAccessToken({
    userId: user.id,
    username: user.username,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
    expiresIn: 15 * 60, // 15 minutes in seconds
  };
}

export async function logoutAllForUser(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { isRevoked: true },
  });
}
