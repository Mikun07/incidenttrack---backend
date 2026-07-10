import { ActionItemStatus, IncidentSeverity, IncidentStatus } from "@prisma/client";
import request from "supertest";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/app.js";
import { resetDatabase } from "./helpers/db.js";
import { createResponder } from "./helpers/auth.js";

const app = createApp();

beforeEach(async () => {
  await resetDatabase();
});

afterEach(async () => {
  await resetDatabase();
});

const validPostmortem = {
  rootCause: "A misconfigured connection pool exhausted database connections under load.",
  impactSummary: "Approximately 12% of API requests failed for 45 minutes.",
  detectionSummary: "Triggered by the error rate alert on the public API dashboard.",
  resolutionSummary: "Connection pool size was increased and the service was restarted.",
  lessonsLearned: "Add alerting on connection pool saturation before it causes failures."
};

async function createServiceAndIncident(authHeader: string) {
  const serviceResponse = await request(app)
    .post("/api/services")
    .set("Authorization", authHeader)
    .send({ name: "Public API" });

  const incidentResponse = await request(app)
    .post("/api/incidents")
    .set("Authorization", authHeader)
    .send({
      title: "API returning 500s",
      summary: "Elevated error rates on the public API affecting all customers.",
      severity: IncidentSeverity.SEV3,
      serviceId: serviceResponse.body.service.id
    });

  return incidentResponse.body.incident as { id: string };
}

async function resolveIncident(authHeader: string, incidentId: string) {
  await request(app)
    .patch(`/api/incidents/${incidentId}/status`)
    .set("Authorization", authHeader)
    .send({ status: IncidentStatus.INVESTIGATING });

  await request(app)
    .patch(`/api/incidents/${incidentId}/status`)
    .set("Authorization", authHeader)
    .send({ status: IncidentStatus.MITIGATED });

  await request(app)
    .patch(`/api/incidents/${incidentId}/status`)
    .set("Authorization", authHeader)
    .send({ status: IncidentStatus.RESOLVED });
}

describe("PUT /api/incidents/:incidentId/postmortem", () => {
  it("rejects creating a postmortem before the incident is resolved", async () => {
    const { authHeader } = await createResponder(app);
    const incident = await createServiceAndIncident(authHeader);

    const response = await request(app)
      .put(`/api/incidents/${incident.id}/postmortem`)
      .set("Authorization", authHeader)
      .send(validPostmortem);

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("incident_not_ready_for_postmortem");
  });

  it("allows creating a postmortem draft once the incident is resolved", async () => {
    const { authHeader } = await createResponder(app);
    const incident = await createServiceAndIncident(authHeader);
    await resolveIncident(authHeader, incident.id);

    const response = await request(app)
      .put(`/api/incidents/${incident.id}/postmortem`)
      .set("Authorization", authHeader)
      .send(validPostmortem);

    expect(response.status).toBe(200);
    expect(response.body.postmortem.publishedAt).toBeNull();
  });

  it("publishes a postmortem when publish is true", async () => {
    const { authHeader } = await createResponder(app);
    const incident = await createServiceAndIncident(authHeader);
    await resolveIncident(authHeader, incident.id);

    const response = await request(app)
      .put(`/api/incidents/${incident.id}/postmortem`)
      .set("Authorization", authHeader)
      .send({ ...validPostmortem, publish: true });

    expect(response.status).toBe(200);
    expect(response.body.postmortem.publishedAt).not.toBeNull();
  });

  it("updates an existing postmortem instead of creating a duplicate", async () => {
    const { authHeader } = await createResponder(app);
    const incident = await createServiceAndIncident(authHeader);
    await resolveIncident(authHeader, incident.id);

    await request(app)
      .put(`/api/incidents/${incident.id}/postmortem`)
      .set("Authorization", authHeader)
      .send(validPostmortem);

    const updateResponse = await request(app)
      .put(`/api/incidents/${incident.id}/postmortem`)
      .set("Authorization", authHeader)
      .send({ ...validPostmortem, rootCause: "Updated root cause after further investigation." });

    expect(updateResponse.status).toBe(200);

    const getResponse = await request(app)
      .get(`/api/incidents/${incident.id}/postmortem`)
      .set("Authorization", authHeader);

    expect(getResponse.body.postmortem.rootCause).toBe(
      "Updated root cause after further investigation."
    );
  });

  it("rejects a postmortem field shorter than the minimum length", async () => {
    const { authHeader } = await createResponder(app);
    const incident = await createServiceAndIncident(authHeader);
    await resolveIncident(authHeader, incident.id);

    const response = await request(app)
      .put(`/api/incidents/${incident.id}/postmortem`)
      .set("Authorization", authHeader)
      .send({ ...validPostmortem, rootCause: "too short" });

    expect(response.status).toBe(400);
  });
});

describe("GET /api/incidents/:incidentId/postmortem", () => {
  it("returns 404 when no postmortem exists yet", async () => {
    const { authHeader } = await createResponder(app);
    const incident = await createServiceAndIncident(authHeader);

    const response = await request(app)
      .get(`/api/incidents/${incident.id}/postmortem`)
      .set("Authorization", authHeader);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("postmortem_not_found");
  });
});

describe("action items", () => {
  it("creates an action item linked to the incident's postmortem", async () => {
    const { authHeader, user: responder } = await createResponder(app);
    const incident = await createServiceAndIncident(authHeader);
    await resolveIncident(authHeader, incident.id);
    await request(app)
      .put(`/api/incidents/${incident.id}/postmortem`)
      .set("Authorization", authHeader)
      .send(validPostmortem);

    const response = await request(app)
      .post(`/api/incidents/${incident.id}/action-items`)
      .set("Authorization", authHeader)
      .send({
        title: "Add connection pool saturation alert",
        assigneeId: responder.id
      });

    expect(response.status).toBe(201);
    expect(response.body.actionItem.postmortemId).not.toBeNull();
    expect(response.body.actionItem.status).toBe(ActionItemStatus.OPEN);
  });

  it("allows creating an action item before a postmortem exists, with a null postmortemId", async () => {
    const { authHeader } = await createResponder(app);
    const incident = await createServiceAndIncident(authHeader);

    const response = await request(app)
      .post(`/api/incidents/${incident.id}/action-items`)
      .set("Authorization", authHeader)
      .send({ title: "Investigate root cause" });

    expect(response.status).toBe(201);
    expect(response.body.actionItem.postmortemId).toBeNull();
  });

  it("rejects an action item assigned to a nonexistent user", async () => {
    const { authHeader } = await createResponder(app);
    const incident = await createServiceAndIncident(authHeader);

    const response = await request(app)
      .post(`/api/incidents/${incident.id}/action-items`)
      .set("Authorization", authHeader)
      .send({
        title: "Investigate root cause",
        assigneeId: "00000000-0000-0000-0000-000000000000"
      });

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("assignee_not_found");
  });

  it("updates an action item's status", async () => {
    const { authHeader } = await createResponder(app);
    const incident = await createServiceAndIncident(authHeader);

    const createResponse = await request(app)
      .post(`/api/incidents/${incident.id}/action-items`)
      .set("Authorization", authHeader)
      .send({ title: "Investigate root cause" });

    const response = await request(app)
      .patch(`/api/action-items/${createResponse.body.actionItem.id}/status`)
      .set("Authorization", authHeader)
      .send({ status: ActionItemStatus.DONE });

    expect(response.status).toBe(200);
    expect(response.body.actionItem.status).toBe(ActionItemStatus.DONE);
  });
});
