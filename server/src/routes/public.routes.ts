import { FastifyInstance } from "fastify";
import { prisma } from "../lib/db";

/**
 * Public endpoints: /api/health, /api/about, /api/projects, /api/journey, /api/blog
 * These endpoints return published content only for public lists.
 */
export default async function publicRoutes(fastify: FastifyInstance) {
  fastify.get("/api/health", async (_req, reply) => {
    return reply.send({ ok: true, env: process.env.NODE_ENV || "development" });
  });

  fastify.get("/api/about", async (_req, reply) => {
    // try fetch about from DB (if you store it); fallback to static
    const about = {
      name: "Anurag Basuri",
      tagline: "MERN + AI/ML | System-first Engineer",
      short: "Problem solver, builder of scalable systems and ML experiments.",
      skills: {
        frontend: ["React", "TypeScript", "Tailwind"],
        backend: ["Node", "Express", "Postgres"],
        ml: ["Python", "PyTorch", "tfjs"],
      },
    };
    return reply.send(about);
  });

  fastify.get("/api/projects", async (_req, reply) => {
    // prefer DB published projects; fallback to static if DB empty
    const projects = await prisma.project.findMany({
      where: { status: "published", deletedAt: null },
    });
    if (projects && projects.length) return reply.send({ items: projects });
    // fallback sample
    return reply.send({
      items: [
        {
          id: "video-stream",
          title: "VideoStream",
          summary: "Low-latency video streaming platform",
          tags: ["MERN", "WebRTC"],
        },
      ],
    });
  });

  fastify.get("/api/projects/:id", async (request, reply) => {
    const id = (request.params as any).id;
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project)
      return reply
        .status(404)
        .send({ error: { code: "not_found", message: "Project not found" } });
    return reply.send(project);
  });

  fastify.get("/api/journey", async (_req, reply) => {
    const items = await prisma.journeyEntry.findMany({
      orderBy: [{ year: "asc" }, { order: "asc" }],
    });
    if (items && items.length) return reply.send({ items });
    return reply.send({
      items: [
        {
          id: "1",
          year: 2017,
          title: "DSA Foundations",
          description: "Started learning algorithms.",
          category: "education",
          order: 1,
        },
      ],
    });
  });

  fastify.get("/api/blog", async (_req, reply) => {
    const posts = await prisma.blogPost.findMany({
      where: { status: "published" },
      orderBy: { publishedAt: "desc" },
    });
    if (posts && posts.length) return reply.send({ posts });
    return reply.send({
      posts: [
        {
          id: "stub-1",
          slug: "building-video-stream",
          title: "Building a Low-Latency Video Stream",
          excerpt: "Design decisions...",
        },
      ],
    });
  });
}
