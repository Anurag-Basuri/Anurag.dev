import { prisma } from '../../lib/db';
import { Project } from '@prisma/client';

export class ProjectRepository {
  async findAll(includeDeleted = false): Promise<Project[]> {
    return prisma.project.findMany({
      where: includeDeleted ? {} : { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPublished(): Promise<Project[]> {
    return prisma.project.findMany({
      where: {
        status: 'published',
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string): Promise<Project | null> {
    return prisma.project.findUnique({
      where: { id },
    });
  }

  async create(data: {
    title: string;
    description: string;
    techStack?: string[];
    githubUrl?: string;
    liveUrl?: string;
    status?: string;
  }): Promise<Project> {
    return prisma.project.create({
      data: {
        ...data,
        techStack: data.techStack || [],
        status: data.status || 'draft',
      },
    });
  }

  async update(id: string, data: Partial<Project>): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data,
    });
  }

  async softDelete(id: string): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async publish(id: string): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data: { status: 'published' },
    });
  }

  async updateGitHubStats(
    id: string,
    stats: { stars?: number; forks?: number; commits?: number }
  ): Promise<Project> {
    return prisma.project.update({
      where: { id },
      data: stats,
    });
  }
}

export const projectRepository = new ProjectRepository();
