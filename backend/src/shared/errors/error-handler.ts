import type { FastifyInstance } from "fastify";


export function setupErrorHandler(app: FastifyInstance) {

  app.setErrorHandler(
    async (error: any, request, reply) => {

      request.log.error(error);


      return reply
        .status(error.statusCode || 500)
        .send({

          error: true,

          message:
            error.message ||
            "Internal server error"

        });

    }
  );

}