import { UserRole } from "@prisma/client";
import type { Express } from "express";
import request from "supertest";
import { hashPassword } from "../../src/lib/password.js";
import { prisma } from "../../src/lib/prisma.js";
import { signAccessToken } from "../../src/lib/jwt.js";

export const TEST_PASSWORD = "Test-Password-123";

export async function createUser(app: Express, role: UserRole, emailPrefix = role.toLowerCase()) {
  const email = `${emailPrefix}-${Math.random().toString(36).slice(2, 10)}@example.com`;

  const user = await prisma.user.create({
    data: {
      email,
      name: `Test ${role}`,
      role,
      passwordHash: await hashPassword(TEST_PASSWORD)
    }
  });

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    role: user.role
  });

  return {
    user,
    accessToken,
    authHeader: `Bearer ${accessToken}`
  };
}

export async function createAdmin(app: Express) {
  return createUser(app, UserRole.ADMIN, "admin");
}

export async function createResponder(app: Express) {
  return createUser(app, UserRole.RESPONDER, "responder");
}

export async function createViewer(app: Express) {
  return createUser(app, UserRole.VIEWER, "viewer");
}

export function agent(app: Express) {
  return request(app);
}
