import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const contactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string().optional().default(""),
  message: z.string().min(1),
});

export const createProjectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  techStack: z.array(z.string()).optional().default([]),
  githubUrl: z.string().url().optional(),
  liveUrl: z.string().url().optional(),
  status: z.enum(["draft", "published"]).default("draft"),
});
