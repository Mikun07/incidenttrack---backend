import { UserRole } from "@prisma/client";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { resetDatabase } from "./helpers/db.js";
import { createAdmin, createResponder, createViewer } from "./helpers/auth.js";

const app = createApp();

beforeEach(async () => {
  await resetDatabase();
});

afterEach(async () => {
  await resetDatabase();
});

describe("users routes", () => {
  it("allows an admin to list users", async () => {
    const { authHeader } = await createAdmin(app);

    const response = await request(app).get("/api/users").set("Authorization", authHeader);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.users)).toBe(true);
  });

  it("denies a responder from listing users", async () => {
    const { authHeader } = await createResponder(app);

    const response = await request(app).get("/api/users").set("Authorization", authHeader);

    expect(response.status).toBe(403);
    expect(response.body.error.code).toBe("permission_denied");
  });

  it("denies a viewer from listing users", async () => {
    const { authHeader } = await createViewer(app);

    const response = await request(app).get("/api/users").set("Authorization", authHeader);

    expect(response.status).toBe(403);
  });

  it("prevents demoting the last remaining admin", async () => {
    const { authHeader, user: admin } = await createAdmin(app);

    const response = await request(app)
      .patch(`/api/users/${admin.id}/role`)
      .set("Authorization", authHeader)
      .send({ role: UserRole.VIEWER });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("last_admin_required");
  });

  it("allows demoting an admin when another admin remains", async () => {
    const { authHeader } = await createAdmin(app);
    const { user: secondAdmin } = await createAdmin(app);

    const response = await request(app)
      .patch(`/api/users/${secondAdmin.id}/role`)
      .set("Authorization", authHeader)
      .send({ role: UserRole.RESPONDER });

    expect(response.status).toBe(200);
    expect(response.body.user.role).toBe(UserRole.RESPONDER);
  });
});

describe("services routes", () => {
  it("allows a viewer to read services but not create one", async () => {
    const { authHeader } = await createViewer(app);

    const listResponse = await request(app).get("/api/services").set("Authorization", authHeader);
    expect(listResponse.status).toBe(200);

    const createResponse = await request(app)
      .post("/api/services")
      .set("Authorization", authHeader)
      .send({ name: "Payments API" });

    expect(createResponse.status).toBe(403);
  });

  it("allows a responder to create a service", async () => {
    const { authHeader } = await createResponder(app);

    const response = await request(app)
      .post("/api/services")
      .set("Authorization", authHeader)
      .send({ name: "Payments API" });

    expect(response.status).toBe(201);
    expect(response.body.service.slug).toBe("payments-api");
  });

  it("rejects unauthenticated access entirely", async () => {
    const response = await request(app).get("/api/services");

    expect(response.status).toBe(401);
  });
});

describe("audit routes", () => {
  it("denies non-admins access to audit logs", async () => {
    const { authHeader } = await createResponder(app);

    const response = await request(app).get("/api/audit/logs").set("Authorization", authHeader);

    expect(response.status).toBe(403);
  });

  it("allows an admin to read audit logs produced by other actions", async () => {
    const { authHeader: responderAuth } = await createResponder(app);
    const { authHeader: adminAuth } = await createAdmin(app);

    await request(app)
      .post("/api/services")
      .set("Authorization", responderAuth)
      .send({ name: "Notifications" });

    const response = await request(app).get("/api/audit/logs").set("Authorization", adminAuth);

    expect(response.status).toBe(200);
    expect(response.body.logs.some((log: { action: string }) => log.action === "service.created")).toBe(
      true
    );
  });
});
