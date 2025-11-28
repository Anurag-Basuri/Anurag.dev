import { FastifyInstance } from "fastify";
import { contactSchema } from "../../schemas/zod-schemas";
import { submitContact } from "./contact.service";

export default async function contactRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/api/contact",
    {
      schema: {
        body: contactSchema,
      },
    },
    async (request, reply) => {
      const ip = request.ip || (request as any).raw?.connection?.remoteAddress;
      const { name, email, subject, message } = request.body as any;

      // TODO: enforce rate-limit using Redis
      const rec = await submitContact({ name, email, subject, message, ip });
      return reply.status(201).send({ ok: true, id: rec.id });
    }
  );
}
