import { prisma } from "./prisma";
import { createDatabaseIfNotExists } from "./setup";

export async function connectDatabase() {
  try {
    await createDatabaseIfNotExists();
    await prisma.$connect();
    console.log("Database connected");
  } catch (error) {
    console.error("Failed to connect to the database", error);
    throw error;
  }
}