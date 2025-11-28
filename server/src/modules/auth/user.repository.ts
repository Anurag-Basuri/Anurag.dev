import { prisma } from '../../lib/db';
import { User } from '@prisma/client';

export class UserRepository {
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByUsername(username: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { username },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: {
    username: string;
    email: string;
    passwordHash: string;
  }): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  async trackFailedLogin(userId: string): Promise<void> {
    const user = await this.findById(userId);
    if (!user) return;

    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);

    // Reset counter if last failed attempt was more than 15 minutes ago
    const shouldReset = user.lastFailedAt && user.lastFailedAt < fifteenMinutesAgo;
    const newFailedAttempts = shouldReset ? 1 : (user.failedAttempts || 0) + 1;

    // Lock account if 3 or more failed attempts
    const shouldLock = newFailedAttempts >= 3;
    const lockedUntil = shouldLock ? new Date(now.getTime() + 30 * 60 * 1000) : null;

    await this.update(userId, {
      failedAttempts: newFailedAttempts,
      lastFailedAt: now,
      isLocked: shouldLock,
      lockedUntil,
    });
  }

  async resetFailedAttempts(userId: string): Promise<void> {
    await this.update(userId, {
      failedAttempts: 0,
      lastFailedAt: null,
      isLocked: false,
      lockedUntil: null,
    });
  }

  async isAccountLocked(userId: string): Promise<boolean> {
    const user = await this.findById(userId);
    if (!user || !user.isLocked) return false;

    // Check if lock has expired
    if (user.lockedUntil && user.lockedUntil < new Date()) {
      await this.resetFailedAttempts(userId);
      return false;
    }

    return true;
  }
}

export const userRepository = new UserRepository();
