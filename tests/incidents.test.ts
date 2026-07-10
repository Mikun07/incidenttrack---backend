import { IncidentSeverity, IncidentStatus, ServiceStatus } from "@prisma/client";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { prisma } from "../src/lib/prisma.js";
import { resetDatabase } from "./helpers/db.js";
import { createResponder, createViewer } from "./helpers/auth.js";

const app = createApp();

beforeEach(async () => {
  await resetDatabase();
});

afterEach(async () => {
  await resetDatabase();
});

async function createService(authHeader: string, overrides: Partial<{ name: string }> = {}) {
  const response = await request(app)
    .post("/api/services")
    .set("Authorization", authHeader)
    .send({ name: overrides.name ?? "Public API" });

  return response.body.service as { id: string; slug: string; status: ServiceStatus };
}

async function createIncident(
  authHeader: string,
  serviceId: string,
  severity: IncidentSeverity = IncidentSeverity.SEV3
) {
  const response = await request(app)
    .post("/api/incidents")
    .set("Authorization", authHeader)
    .send({
      title: "API returning 500s",
      summary: "Elevated error rates on the public API affecting all customers.",
      severity,
      serviceId
    });

  return response.body.incident as {
    id: string;
    status: IncidentStatus;
    timeline: Array<{ type: string; message: string }>;
  };
}

describe("POST /api/incidents", () => {
  it("creates an incident opened with a timeline entry", async () => {
    const { authHeader } = await createResponder(app);
    const service = await createService(authHeader);

    const incident = await createIncident(authHeader, service.id);

    expect(incident.status).toBe(IncidentStatus.OPEN);
    expect(incident.timeline).toHaveLength(1);
    expect(incident.timeline[0]).toMatchObject({
      type: "STATUS_CHANGE",
      message: "Incident opened."
    });
  });

  it("degrades the affected service to OUTAGE for a SEV1 incident", async () => {
    const { authHeader } = await createResponder(app);
    const service = await createService(authHeader);

    await createIncident(authHeader, service.id, IncidentSeverity.SEV1);

    const updatedService = await prisma.service.findUniqueOrThrow({ where: { id: service.id } });
    expect(updatedService.status).toBe(ServiceStatus.OUTAGE);
  });

  it("degrades the affected service to DEGRADED for a SEV2 incident", async () => {
    const { authHeader } = await createResponder(app);
    const service = await createService(authHeader);

    await createIncident(authHeader, service.id, IncidentSeverity.SEV2);

    const updatedService = await prisma.service.findUniqueOrThrow({ where: { id: service.id } });
    expect(updatedService.status).toBe(ServiceStatus.DEGRADED);
  });

  it("does not change service status for a SEV3 incident", async () => {
    const { authHeader } = await createResponder(app);
    const service = await createService(authHeader);

    await createIncident(authHeader, service.id, IncidentSeverity.SEV3);

    const updatedService = await prisma.service.findUniqueOrThrow({ where: { id: service.id } });
    expect(updatedService.status).toBe(ServiceStatus.OPERATIONAL);
  });

  it("rejects creating an incident against a nonexistent service", async () => {
    const { authHeader } = await createResponder(app);

    const response = await request(app)
      .post("/api/incidents")
      .set("Authorization", authHeader)
      .send({
        title: "Ghost service incident",
        summary: "This incident references a service that does not exist.",
        severity: IncidentSeverity.SEV3,
        serviceId: "00000000-0000-0000-0000-000000000000"
      });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("service_not_found");
  });

  it("denies a viewer from creating an incident", async () => {
    const { authHeader: responderAuth } = await createResponder(app);
    const { authHeader: viewerAuth } = await createViewer(app);
    const service = await createService(responderAuth);

    const response = await request(app)
      .post("/api/incidents")
      .set("Authorization", viewerAuth)
      .send({
        title: "Should not be created",
        summary: "Viewers cannot open incidents per the authorization model.",
        severity: IncidentSeverity.SEV3,
        serviceId: service.id
      });

    expect(response.status).toBe(403);
  });
});

describe("PATCH /api/incidents/:id/status", () => {
  it("allows the documented forward transitions", async () => {
    const { authHeader } = await createResponder(app);
    const service = await createService(authHeader);
    const incident = await createIncident(authHeader, service.id);

    const toInvestigating = await request(app)
      .patch(`/api/incidents/${incident.id}/status`)
      .set("Authorization", authHeader)
      .send({ status: IncidentStatus.INVESTIGATING });

    expect(toInvestigating.status).toBe(200);
    expect(toInvestigating.body.incident.status).toBe(IncidentStatus.INVESTIGATING);

    const toMitigated = await request(app)
      .patch(`/api/incidents/${incident.id}/status`)
      .set("Authorization", authHeader)
      .send({ status: IncidentStatus.MITIGATED });

    expect(toMitigated.status).toBe(200);
    expect(toMitigated.body.incident.mitigatedAt).not.toBeNull();

    const toResolved = await request(app)
      .patch(`/api/incidents/${incident.id}/status`)
      .set("Authorization", authHeader)
      .send({ status: IncidentStatus.RESOLVED });

    expect(toResolved.status).toBe(200);
    expect(toResolved.body.incident.resolvedAt).not.toBeNull();
  });

  it("rejects skipping straight from OPEN to RESOLVED", async () => {
    const { authHeader } = await createResponder(app);
    const service = await createService(authHeader);
    const incident = await createIncident(authHeader, service.id);

    const response = await request(app)
      .patch(`/api/incidents/${incident.id}/status`)
      .set("Authorization", authHeader)
      .send({ status: IncidentStatus.RESOLVED });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("invalid_status_transition");
  });

  it("rejects transitioning to the same status", async () => {
    const { authHeader } = await createResponder(app);
    const service = await createService(authHeader);
    const incident = await createIncident(authHeader, service.id);

    const response = await request(app)
      .patch(`/api/incidents/${incident.id}/status`)
      .set("Authorization", authHeader)
      .send({ status: IncidentStatus.OPEN });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("status_unchanged");
  });

  it("rejects any transition out of REVIEWED, the terminal state", async () => {
    const { authHeader } = await createResponder(app);
    const service = await createService(authHeader);
    const incident = await createIncident(authHeader, service.id);

    for (const status of [
      IncidentStatus.INVESTIGATING,
      IncidentStatus.MITIGATED,
      IncidentStatus.RESOLVED,
      IncidentStatus.REVIEWED
    ]) {
      await request(app)
        .patch(`/api/incidents/${incident.id}/status`)
        .set("Authorization", authHeader)
        .send({ status });
    }

    const response = await request(app)
      .patch(`/api/incidents/${incident.id}/status`)
      .set("Authorization", authHeader)
      .send({ status: IncidentStatus.OPEN });

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("invalid_status_transition");
  });

  it("records a timeline entry for each status transition", async () => {
    const { authHeader } = await createResponder(app);
    const service = await createService(authHeader);
    const incident = await createIncident(authHeader, service.id);

    await request(app)
      .patch(`/api/incidents/${incident.id}/status`)
      .set("Authorization", authHeader)
      .send({ status: IncidentStatus.INVESTIGATING, message: "Paging on-call." });

    const getResponse = await request(app)
      .get(`/api/incidents/${incident.id}`)
      .set("Authorization", authHeader);

    const timeline = getResponse.body.incident.timeline as Array<{ message: string }>;
    expect(timeline.some((entry) => entry.message === "Paging on-call.")).toBe(true);
  });
});

describe("POST /api/incidents/:id/assign", () => {
  it("assigns an incident to a valid user and records the timeline entry", async () => {
    const { authHeader, user: responder } = await createResponder(app);
    const service = await createService(authHeader);
    const incident = await createIncident(authHeader, service.id);

    const response = await request(app)
      .post(`/api/incidents/${incident.id}/assign`)
      .set("Authorization", authHeader)
      .send({ ownerId: responder.id });

    expect(response.status).toBe(200);
    expect(response.body.incident.owner.id).toBe(responder.id);
  });

  it("rejects assigning to a nonexistent user", async () => {
    const { authHeader } = await createResponder(app);
    const service = await createService(authHeader);
    const incident = await createIncident(authHeader, service.id);

    const response = await request(app)
      .post(`/api/incidents/${incident.id}/assign`)
      .set("Authorization", authHeader)
      .send({ ownerId: "00000000-0000-0000-0000-000000000000" });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("owner_not_found");
  });
});

describe("GET /api/incidents", () => {
  it("paginates and filters by status", async () => {
    const { authHeader } = await createResponder(app);
    const service = await createService(authHeader);

    const first = await createIncident(authHeader, service.id);
    await createIncident(authHeader, service.id);

    await request(app)
      .patch(`/api/incidents/${first.id}/status`)
      .set("Authorization", authHeader)
      .send({ status: IncidentStatus.INVESTIGATING });

    const response = await request(app)
      .get("/api/incidents")
      .query({ status: IncidentStatus.INVESTIGATING, page: 1, pageSize: 10 })
      .set("Authorization", authHeader);

    expect(response.status).toBe(200);
    expect(response.body.incidents).toHaveLength(1);
    expect(response.body.pagination.total).toBe(1);
  });
});
