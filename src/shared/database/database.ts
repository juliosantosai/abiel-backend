import { prisma } from "./prisma";

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log("Database connected");
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}