"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
const prisma_1 = require("./prisma");
async function connectDatabase() {
    try {
        await prisma_1.prisma.$connect();
        console.log("Database connected");
    }
    catch (error) {
        console.error("Failed to connect to the database", error);
        throw error;
    }
}
