import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/db";
import { env } from "../../config/env";

const SALT_ROUNDS = 12;

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function comparePassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export function signAccessToken(payload: object) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXP,
  });
}

export function signRefreshToken(payload: object) {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.REFRESH_TOKEN_EXP,
  });
}

export async function loginUser(username: string, password: string) {
  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return null;
  const ok = await comparePassword(password, user.passwordHash);
  if (!ok) return null;

  const accessToken = signAccessToken({
    sub: user.id,
    username: user.username,
    role: "admin",
  });
  const refreshToken = signRefreshToken({ sub: user.id });

  // persist refresh token
  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // conservative expiry
    },
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, username: user.username, email: user.email },
  };
}

export async function rotateRefreshToken(oldToken: string) {
  try {
    const payload: any = jwt.verify(oldToken, env.JWT_REFRESH_SECRET);
    const stored = await prisma.refreshToken.findUnique({
      where: { token: oldToken },
    });
    if (!stored || stored.isRevoked) throw new Error("invalid_refresh");

    // revoke old
    await prisma.refreshToken.update({
      where: { token: oldToken },
      data: { isRevoked: true },
    });

    // issue new
    const newToken = signRefreshToken({ sub: payload.sub });
    await prisma.refreshToken.create({
      data: {
        token: newToken,
        userId: payload.sub,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const accessToken = signAccessToken({ sub: payload.sub });
    return { accessToken, refreshToken: newToken };
  } catch (err) {
    return null;
  }
}

export async function logoutAllForUser(userId: string) {
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { isRevoked: true },
  });
}
