import swagger from "@fastify/swagger";
import swaggerUI from "@fastify/swagger-ui";
import type { FastifyInstance } from "fastify";

export async function setupSwagger(app: FastifyInstance) {

  await app.register(swagger, {
    openapi: {
      info: {
        title: "Abiel Backend API",
        description: "API principal de la plataforma Abiel AI",
        version: "1.0.0",
      },
    },
  });


  await app.register(swaggerUI, {
    routePrefix: "/docs",
  });

}