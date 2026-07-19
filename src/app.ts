import Fastify from "fastify";
import { logger } from "./shared/logger/logger";
import { setupSwagger } from "./shared/config/swagger";
import { setupErrorHandler } from "./shared/errors/error-handler";
import { PrismaEmpresaRepository } from "./modules/empresa/infrastructure/prisma-empresa-repository";
import { EmpresaService } from "./modules/empresa/application/empresa-service";
import { registerEmpresaRoutes } from "./modules/empresa/presentation/empresa-controller";
import { PrismaUsuarioRepository } from "./modules/usuario/infrastructure/prisma-usuario-repository";
import { UsuarioService } from "./modules/usuario/application/usuario-service";
import { registerUsuarioRoutes } from "./modules/usuario/presentation/usuario-controller";

export async function createApp() {
  const app = Fastify({
    logger,
  });

  setupErrorHandler(app);
  await setupSwagger(app);

  const empresaRepository = new PrismaEmpresaRepository();
  const empresaService = new EmpresaService(empresaRepository);
  registerEmpresaRoutes(app, empresaService);

  const usuarioRepository = new PrismaUsuarioRepository();
  const usuarioService = new UsuarioService(usuarioRepository);
  registerUsuarioRoutes(app, usuarioService);

  app.get(
    "/",
    {
      schema: {
        description: "API base endpoint",
        summary: "Root endpoint",
        response: {
          200: {
            type: "object",
            properties: {
              name: { type: "string" },
              version: { type: "string" },
              status: { type: "string" },
            },
          },
        },
      },
    },
    async () => ({
      name: "Abiel Backend",
      version: "1.0.0",
      status: "running",
    })
  );

  app.get(
    "/health",
    {
      schema: {
        description: "Health check endpoint",
        summary: "Health status",
        response: {
          200: {
            type: "object",
            properties: {
              status: { type: "string" },
              service: { type: "string" },
            },
          },
        },
      },
    },
    async () => ({
      status: "ok",
      service: "abiel-backend",
    })
  );


  return app;
}