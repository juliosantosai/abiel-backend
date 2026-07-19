"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const fastify_1 = __importDefault(require("fastify"));
const logger_1 = require("./shared/logger/logger");
const swagger_1 = require("./shared/config/swagger");
const error_handler_1 = require("./shared/errors/error-handler");
const prisma_empresa_repository_1 = require("./modules/empresa/infrastructure/prisma-empresa-repository");
const empresa_service_1 = require("./modules/empresa/application/empresa-service");
const empresa_controller_1 = require("./modules/empresa/presentation/empresa-controller");
async function createApp() {
    const app = (0, fastify_1.default)({
        logger: logger_1.logger,
    });
    (0, error_handler_1.setupErrorHandler)(app);
    await (0, swagger_1.setupSwagger)(app);
    const empresaRepository = new prisma_empresa_repository_1.PrismaEmpresaRepository();
    const empresaService = new empresa_service_1.EmpresaService(empresaRepository);
    (0, empresa_controller_1.registerEmpresaRoutes)(app, empresaService);
    app.get("/", {
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
    }, async () => ({
        name: "Abiel Backend",
        version: "1.0.0",
        status: "running",
    }));
    app.get("/health", {
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
    }, async () => ({
        status: "ok",
        service: "abiel-backend",
    }));
    return app;
}
