import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { resetDatabase } from "./helpers/db.js";
import { createUser } from "./helpers/auth.js";
import { UserRole } from "@prisma/client";

const app = createApp();

beforeEach(async () => {
  await resetDatabase();
});

afterEach(async () => {
  await resetDatabase();
});

describe("POST /api/auth/register", () => {
  it("creates a new user with the RESPONDER role and returns an access token", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "new.user@example.com",
      name: "New User",
      password: "a-valid-password"
    });

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({
      email: "new.user@example.com",
      name: "New User",
      role: UserRole.RESPONDER
    });
    expect(response.body.user.passwordHash).toBeUndefined();
    expect(typeof response.body.accessToken).toBe("string");

    const storedUser = await prisma.user.findUnique({ where: { email: "new.user@example.com" } });
    expect(storedUser?.passwordHash).not.toBe("a-valid-password");
  });

  it("lowercases email on registration so lookups are case-insensitive", async () => {
    await request(app).post("/api/auth/register").send({
      email: "Mixed.Case@Example.com",
      name: "Mixed Case",
      password: "a-valid-password"
    });

    const storedUser = await prisma.user.findUnique({ where: { email: "mixed.case@example.com" } });
    expect(storedUser).not.toBeNull();
  });

  it("rejects registration with an already-used email", async () => {
    await request(app).post("/api/auth/register").send({
      email: "duplicate@example.com",
      name: "First",
      password: "a-valid-password"
    });

    const response = await request(app).post("/api/auth/register").send({
      email: "duplicate@example.com",
      name: "Second",
      password: "another-password"
    });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("email_already_registered");
  });

  it("rejects a password shorter than the minimum length", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "short@example.com",
      name: "Short Password",
      password: "short"
    });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe("validation_failed");
  });

  it("rejects an invalid email format", async () => {
    const response = await request(app).post("/api/auth/register").send({
      email: "not-an-email",
      name: "Bad Email",
      password: "a-valid-password"
    });

    expect(response.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  it("authenticates with correct credentials", async () => {
    await request(app).post("/api/auth/register").send({
      email: "login.user@example.com",
      name: "Login User",
      password: "correct-password"
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "login.user@example.com",
      password: "correct-password"
    });

    expect(response.status).toBe(200);
    expect(typeof response.body.accessToken).toBe("string");
  });

  it("rejects an incorrect password without leaking whether the email exists", async () => {
    await request(app).post("/api/auth/register").send({
      email: "login.user2@example.com",
      name: "Login User",
      password: "correct-password"
    });

    const wrongPassword = await request(app).post("/api/auth/login").send({
      email: "login.user2@example.com",
      password: "wrong-password"
    });

    const unknownEmail = await request(app).post("/api/auth/login").send({
      email: "does-not-exist@example.com",
      password: "wrong-password"
    });

    expect(wrongPassword.status).toBe(401);
    expect(unknownEmail.status).toBe(401);
    expect(wrongPassword.body.error.code).toBe(unknownEmail.body.error.code);
    expect(wrongPassword.body.error.message).toBe(unknownEmail.body.error.message);
  });
});

describe("GET /api/auth/me", () => {
  it("returns the authenticated user's profile", async () => {
    const { authHeader, user } = await createUser(app, UserRole.RESPONDER);

    const response = await request(app).get("/api/auth/me").set("Authorization", authHeader);

    expect(response.status).toBe(200);
    expect(response.body.user.id).toBe(user.id);
    expect(response.body.user.email).toBe(user.email);
  });

  it("rejects requests with no authorization header", async () => {
    const response = await request(app).get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("authentication_required");
  });

  it("rejects requests with a malformed bearer token", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not-a-real-token");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("invalid_token");
  });

  it("rejects requests missing the Bearer prefix", async () => {
    const { accessToken } = await createUser(app, UserRole.RESPONDER);

    const response = await request(app).get("/api/auth/me").set("Authorization", accessToken);

    expect(response.status).toBe(401);
  });
});
