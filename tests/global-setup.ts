import { execSync } from "node:child_process";
import dotenv from "dotenv";

export default function globalSetup() {
  dotenv.config({ path: ".env.test", override: true });
  process.env.NODE_ENV = "test";

  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set for tests. Copy .env.test.example to .env.test.");
  }

  if (!process.env.DATABASE_URL.includes("incidenttrack_test")) {
    throw new Error("Refusing to run tests unless DATABASE_URL points at incidenttrack_test.");
  }

  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    stdio: "inherit",
    env: process.env
  });
}
