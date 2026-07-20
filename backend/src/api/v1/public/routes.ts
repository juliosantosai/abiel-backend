import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export function registerPublicRoutes(app: FastifyInstance) {
  const plugin = async (instance: FastifyInstance) => {
    instance.get(
      "/",
      async (_request: FastifyRequest, reply: FastifyReply) => ({ name: "Abiel Backend", version: "1.0.0", status: "running" })
    );

    instance.get(
      "/health",
      async (_request: FastifyRequest, reply: FastifyReply) => ({ status: "ok", service: "abiel-backend" })
    );
  };

  app.register(plugin, { prefix: "/public" });
}
