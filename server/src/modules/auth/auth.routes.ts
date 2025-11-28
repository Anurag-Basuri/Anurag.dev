import { FastifyInstance } from "fastify";
import {
  loginUser,
  rotateRefreshToken,
  logoutAllForUser,
} from "./auth.service";
import { loginSchema } from "../../schemas/zod-schemas";

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/api/auth/login",
    {
      schema: {
        body: loginSchema,
      },
    },
    async (request, reply) => {
      const { username, password } = request.body as any;
      const res = await loginUser(username, password);
      if (!res)
        return reply
          .status(401)
          .send({
            error: {
              code: "invalid_credentials",
              message: "Invalid credentials",
            },
          });
      return reply.send({
        ok: true,
        tokens: { access: res.accessToken, refresh: res.refreshToken },
        user: res.user,
      });
    }
  );

  fastify.post("/api/auth/refresh", async (request, reply) => {
    const { refresh } = request.body as any;
    if (!refresh)
      return reply
        .status(400)
        .send({
          error: { code: "missing_refresh", message: "refresh token required" },
        });
    const tokens = await rotateRefreshToken(refresh);
    if (!tokens)
      return reply
        .status(401)
        .send({
          error: { code: "invalid_refresh", message: "Invalid refresh token" },
        });
    return reply.send({ ok: true, tokens });
  });

  fastify.post("/api/auth/logout", async (request, reply) => {
    const { userId } = request.body as any;
    if (!userId)
      return reply
        .status(400)
        .send({ error: { code: "missing_user", message: "userId required" } });
    await logoutAllForUser(userId);
    return reply.send({ ok: true });
  });
}
