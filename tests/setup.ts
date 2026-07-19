process.env.NODE_ENV = "test";

import dotenv from "dotenv";
import { execSync } from "child_process";
import { join } from "path";

dotenv.config();

const root = join(__dirname, "..");
const prismaBin = join(root, "node_modules", ".bin", "prisma");
const schemaPath = join(root, "prisma", "schema.prisma");
let initialized = false;

export function ensurePrismaSchema() {
  if (initialized) {
    return;
  }

  initialized = true;

  try {
    execSync(`${prismaBin} generate --schema ${schemaPath}`, {
      stdio: "inherit",
      cwd: root,
    });
    execSync(`${prismaBin} db push --schema ${schemaPath} --accept-data-loss`, {
      stdio: "inherit",
      cwd: root,
    });
  } catch (error) {
    console.error("Failed to initialize Prisma schema for tests", error);
    process.exit(1);
  }
}

ensurePrismaSchema();
