"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = setupSwagger;
const swagger_1 = __importDefault(require("@fastify/swagger"));
const swagger_ui_1 = __importDefault(require("@fastify/swagger-ui"));
async function setupSwagger(app) {
    await app.register(swagger_1.default, {
        openapi: {
            info: {
                title: "Abiel Backend API",
                description: "API principal de la plataforma Abiel AI",
                version: "1.0.0",
            },
        },
    });
    await app.register(swagger_ui_1.default, {
        routePrefix: "/docs",
    });
}
