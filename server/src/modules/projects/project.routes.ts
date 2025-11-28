import { FastifyInstance } from 'fastify';
import { projectService } from './project.service';
import { authMiddleware } from '../../middleware/auth.middleware';
import { createProjectSchema } from '../../schemas/zod-schemas';

export default async function projectRoutes(fastify: FastifyInstance) {
  // Public endpoints
  
  // Get all published projects
  fastify.get('/api/projects', async (request, reply) => {
    try {
      const projects = await projectService.getPublishedProjects();
      return reply.send({ projects });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch projects',
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  // Get project by ID
  fastify.get('/api/projects/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const project = await projectService.getProjectById(id);

      if (!project || project.deletedAt) {
        return reply.status(404).send({
          error: {
            code: 'PROJECT_NOT_FOUND',
            message: 'Project not found',
            timestamp: new Date().toISOString(),
          },
        });
      }

      return reply.send(project);
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch project',
          timestamp: new Date().toISOString(),
        },
      });
    }
  });

  // Admin endpoints (require authentication)

  // Create project
  fastify.post(
    '/api/admin/projects',
    {
      preHandler: authMiddleware,
      schema: {
        body: createProjectSchema,
      },
    },
    async (request, reply) => {
      try {
        const data = request.body as any;
        const project = await projectService.createProject(data);
        return reply.status(201).send(project);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to create project',
            timestamp: new Date().toISOString(),
          },
        });
      }
    }
  );

  // Update project
  fastify.put(
    '/api/admin/projects/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const data = request.body as any;
        const project = await projectService.updateProject(id, data);
        return reply.send(project);
      } catch (error: any) {
        if (error.message === 'PROJECT_NOT_FOUND') {
          return reply.status(404).send({
            error: {
              code: 'PROJECT_NOT_FOUND',
              message: 'Project not found',
              timestamp: new Date().toISOString(),
            },
          });
        }
        fastify.log.error(error);
        return reply.status(500).send({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to update project',
            timestamp: new Date().toISOString(),
          },
        });
      }
    }
  );

  // Publish project
  fastify.post(
    '/api/admin/projects/:id/publish',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const project = await projectService.publishProject(id);
        return reply.send(project);
      } catch (error: any) {
        if (error.message === 'PROJECT_NOT_FOUND') {
          return reply.status(404).send({
            error: {
              code: 'PROJECT_NOT_FOUND',
              message: 'Project not found',
              timestamp: new Date().toISOString(),
            },
          });
        }
        fastify.log.error(error);
        return reply.status(500).send({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to publish project',
            timestamp: new Date().toISOString(),
          },
        });
      }
    }
  );

  // Delete project (soft delete)
  fastify.delete(
    '/api/admin/projects/:id',
    {
      preHandler: authMiddleware,
    },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const project = await projectService.deleteProject(id);
        return reply.send({
          success: true,
          message: 'Project deleted successfully',
          project,
        });
      } catch (error: any) {
        if (error.message === 'PROJECT_NOT_FOUND') {
          return reply.status(404).send({
            error: {
              code: 'PROJECT_NOT_FOUND',
              message: 'Project not found',
              timestamp: new Date().toISOString(),
            },
          });
        }
        fastify.log.error(error);
        return reply.status(500).send({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to delete project',
            timestamp: new Date().toISOString(),
          },
        });
      }
    }
  );
}
