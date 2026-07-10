import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import type { createApp as createAppFactory } from "../src/app.js";

let createApp: typeof createAppFactory;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.DATABASE_URL ??= "postgresql://localhost:5432/incidenttrack_test?schema=public";
  process.env.JWT_SECRET ??= "incidenttrack-test-jwt-secret-with-at-least-32-chars";

  ({ createApp } = await import("../src/app.js"));
});

describe("health endpoint", () => {
  it("returns the backend health payload", async () => {
    const response = await request(createApp()).get("/health").expect(200);

    expect(response.body).toMatchObject({
      status: "ok",
      service: "incidenttrack-backend"
    });
    expect(response.body.timestamp).toEqual(expect.any(String));
  });
});
