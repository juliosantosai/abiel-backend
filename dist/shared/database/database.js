"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
const prisma_1 = require("./prisma");
const setup_1 = require("./setup");
async function connectDatabase() {
    try {
        await (0, setup_1.createDatabaseIfNotExists)();
        await prisma_1.prisma.$connect();
        console.log("Database connected");
    }
    catch (error) {
        console.error("Failed to connect to the database", error);
        throw error;
    }
}
