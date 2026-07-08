import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!password || password.length < 12) {
    throw new Error("SEED_ADMIN_PASSWORD must be set to at least 12 characters before seeding.");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email: "admin@incidenttrack.local" },
    update: { passwordHash, role: UserRole.ADMIN },
    create: {
      email: "admin@incidenttrack.local",
      name: "IncidentTrack Admin",
      passwordHash,
      role: UserRole.ADMIN
    }
  });

  await prisma.service.upsert({
    where: { slug: "public-api" },
    update: {},
    create: {
      slug: "public-api",
      name: "Public API",
      description: "Primary API consumed by frontend clients."
    }
  });
}

try {
  await main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
