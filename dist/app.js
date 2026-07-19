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
const login_1 = require("./shared/auth/login");
async function createApp() {
    const app = (0, fastify_1.default)({
        logger: logger_1.logger,
    });
    (0, error_handler_1.setupErrorHandler)(app);
    await (0, swagger_1.setupSwagger)(app);
    app.get("/", async () => ({
        name: "Abiel Backend",
        version: "1.0.0",
        status: "running",
    }));
    app.get("/health", async () => ({
        status: "ok",
        service: "abiel-backend",
    }));
    app.post("/auth/login", async (request, reply) => {
        const { email, password } = request.body;
        if (!email || !password) {
            return reply.status(400).send({ error: true, message: "Email and password are required" });
        }
        try {
            const result = (0, login_1.loginUser)(email, password);
            return reply.status(200).send(result);
        }
        catch (error) {
            return reply.status(401).send({ error: true, message: "Invalid credentials" });
        }
    });
    app.get("/auth/me", async (request, reply) => {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return reply.status(401).send({ error: true, message: "Token missing" });
        }
        const token = authHeader.split(" ")[1];
        try {
            const user = (0, login_1.getUserFromToken)(token);
            return reply.status(200).send({ user });
        }
        catch (error) {
            return reply.status(401).send({ error: true, message: "Invalid token" });
        }
    });
    return app;
}
