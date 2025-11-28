import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import sensible from "@fastify/sensible";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import path from "path";
import { env } from "./config/env";

import publicRoutes from "./routes/public.routes";
import authRoutes from "./modules/auth/auth.routes";
import contactRoutes from "./modules/contact/contact.routes";

export function buildApp() {
  const app = Fastify({ logger: { level: process.env.LOG_LEVEL || "info" } });

  app.register(cors, { origin: true });
  app.register(sensible);

  app.register(fastifyJwt, {
    secret: env.JWT_ACCESS_SECRET,
  });

  if (env.NODE_ENV === "development") {
    app.register(swagger, {
      openapi: {
        info: { title: "AnuragOS API", version: "0.1.0" },
      },
    });
    app.register(swaggerUi, {
      routePrefix: "/api-docs",
      uiConfig: { docExpansion: "none" },
    });
  }

  // register routes
  app.register(publicRoutes);
  app.register(authRoutes);
  app.register(contactRoutes);

  // global error handler
  app.setErrorHandler((err, _request, reply) => {
    app.log.error(err);
    const code = (err.statusCode as number) || 500;
    reply.status(code).send({
      error: {
        code: err.code || "internal_error",
        message: code === 500 ? "Internal server error" : err.message,
        timestamp: new Date().toISOString(),
      },
    });
  });

  return app;
}
