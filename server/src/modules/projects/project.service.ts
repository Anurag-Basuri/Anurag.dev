import { projectRepository } from './project.repository';
import { Project } from '@prisma/client';

export class ProjectService {
  async getAllProjects(includeDeleted = false): Promise<Project[]> {
    return projectRepository.findAll(includeDeleted);
  }

  async getPublishedProjects(): Promise<Project[]> {
    return projectRepository.findPublished();
  }

  async getProjectById(id: string): Promise<Project | null> {
    return projectRepository.findById(id);
  }

  async createProject(data: {
    title: string;
    description: string;
    techStack?: string[];
    githubUrl?: string;
    liveUrl?: string;
  }): Promise<Project> {
    // TODO: Create version snapshot (will be implemented in versioning module)
    return projectRepository.create(data);
  }

  async updateProject(
    id: string,
    data: {
      title?: string;
      description?: string;
      techStack?: string[];
      githubUrl?: string;
      liveUrl?: string;
    }
  ): Promise<Project> {
    // TODO: Create version snapshot before update (will be implemented in versioning module)
    const existing = await projectRepository.findById(id);
    if (!existing) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    return projectRepository.update(id, data);
  }

  async publishProject(id: string): Promise<Project> {
    const existing = await projectRepository.findById(id);
    if (!existing) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    return projectRepository.publish(id);
  }

  async deleteProject(id: string): Promise<Project> {
    const existing = await projectRepository.findById(id);
    if (!existing) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    // Soft delete
    return projectRepository.softDelete(id);
  }
}

export const projectService = new ProjectService();
