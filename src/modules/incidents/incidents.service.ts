import {
  IncidentSeverity,
  IncidentStatus,
  Prisma,
  ServiceStatus,
  TimelineEntryType
} from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error-handler.js";
import { writeAuditLog } from "../audit/audit.service.js";
import type {
  AddTimelineEntryInput,
  AssignIncidentInput,
  CreateIncidentInput,
  ListIncidentsQuery,
  TransitionIncidentStatusInput
} from "./incidents.schemas.js";

const incidentInclude = {
  service: true,
  owner: {
    select: {
      id: true,
      email: true,
      name: true,
      role: true
    }
  },
  timeline: {
    orderBy: { createdAt: "asc" as const },
    include: {
      createdBy: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  },
  postmortem: true,
  actionItems: true
};

const allowedTransitions: Record<IncidentStatus, IncidentStatus[]> = {
  OPEN: [IncidentStatus.INVESTIGATING, IncidentStatus.MITIGATED],
  INVESTIGATING: [IncidentStatus.MITIGATED, IncidentStatus.RESOLVED],
  MITIGATED: [IncidentStatus.RESOLVED],
  RESOLVED: [IncidentStatus.REVIEWED],
  REVIEWED: []
};

function timestampForStatus(status: IncidentStatus) {
  const now = new Date();

  if (status === IncidentStatus.MITIGATED) {
    return { mitigatedAt: now };
  }

  if (status === IncidentStatus.RESOLVED) {
    return { resolvedAt: now };
  }

  if (status === IncidentStatus.REVIEWED) {
    return { reviewedAt: now };
  }

  return {};
}

function serviceStatusForIncidentSeverity(severity: IncidentSeverity) {
  if (severity === IncidentSeverity.SEV1) {
    return ServiceStatus.OUTAGE;
  }

  if (severity === IncidentSeverity.SEV2) {
    return ServiceStatus.DEGRADED;
  }

  return undefined;
}

export async function listIncidents(query: ListIncidentsQuery) {
  const where: Prisma.IncidentWhereInput = {
    status: query.status,
    severity: query.severity,
    serviceId: query.serviceId,
    ownerId: query.ownerId
  };

  const skip = (query.page - 1) * query.pageSize;

  const [incidents, total] = await prisma.$transaction([
    prisma.incident.findMany({
      where,
      include: {
        service: true,
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        },
        _count: {
          select: {
            timeline: true,
            actionItems: true
          }
        }
      },
      orderBy: { openedAt: "desc" },
      skip,
      take: query.pageSize
    }),
    prisma.incident.count({ where })
  ]);

  return {
    incidents,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total,
      totalPages: Math.ceil(total / query.pageSize)
    }
  };
}

export async function getIncidentById(incidentId: string) {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: incidentInclude
  });

  if (!incident) {
    throw new AppError(404, "incident_not_found", "The requested incident does not exist.");
  }

  return incident;
}

export async function createIncident(input: CreateIncidentInput, actorId: string) {
  const service = await prisma.service.findUnique({
    where: { id: input.serviceId }
  });

  if (!service) {
    throw new AppError(404, "service_not_found", "The affected service does not exist.");
  }

  if (input.ownerId) {
    const owner = await prisma.user.findUnique({
      where: { id: input.ownerId },
      select: { id: true }
    });

    if (!owner) {
      throw new AppError(404, "owner_not_found", "The assigned owner does not exist.");
    }
  }

  const incident = await prisma.$transaction(async (tx) => {
    const created = await tx.incident.create({
      data: {
        title: input.title,
        summary: input.summary,
        severity: input.severity,
        serviceId: input.serviceId,
        ownerId: input.ownerId
      }
    });

    await tx.incidentTimelineEntry.create({
      data: {
        incidentId: created.id,
        type: TimelineEntryType.STATUS_CHANGE,
        message: "Incident opened.",
        toStatus: IncidentStatus.OPEN,
        createdById: actorId
      }
    });

    const serviceStatus = serviceStatusForIncidentSeverity(input.severity);

    if (serviceStatus) {
      await tx.service.update({
        where: { id: input.serviceId },
        data: { status: serviceStatus }
      });
    }

    await writeAuditLog(
      {
        actorId,
        action: "incident.created",
        entityType: "Incident",
        entityId: created.id,
        metadata: {
          severity: input.severity,
          serviceId: input.serviceId,
          ownerId: input.ownerId
        }
      },
      tx
    );

    return created;
  });

  return getIncidentById(incident.id);
}

export async function transitionIncidentStatus(
  incidentId: string,
  input: TransitionIncidentStatusInput,
  actorId: string
) {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId }
  });

  if (!incident) {
    throw new AppError(404, "incident_not_found", "The requested incident does not exist.");
  }

  if (incident.status === input.status) {
    throw new AppError(409, "status_unchanged", "The incident already has the requested status.");
  }

  if (!allowedTransitions[incident.status].includes(input.status)) {
    throw new AppError(
      409,
      "invalid_status_transition",
      `Incidents cannot transition from ${incident.status} to ${input.status}.`
    );
  }

  const updatedIncident = await prisma.$transaction(async (tx) => {
    const updated = await tx.incident.update({
      where: { id: incidentId },
      data: {
        status: input.status,
        ...timestampForStatus(input.status)
      }
    });

    await tx.incidentTimelineEntry.create({
      data: {
        incidentId,
        type: TimelineEntryType.STATUS_CHANGE,
        message: input.message ?? `Status changed from ${incident.status} to ${input.status}.`,
        fromStatus: incident.status,
        toStatus: input.status,
        createdById: actorId
      }
    });

    await writeAuditLog(
      {
        actorId,
        action: "incident.status_updated",
        entityType: "Incident",
        entityId: incidentId,
        metadata: {
          fromStatus: incident.status,
          toStatus: input.status
        }
      },
      tx
    );

    return updated;
  });

  return getIncidentById(updatedIncident.id);
}

export async function addTimelineEntry(
  incidentId: string,
  input: AddTimelineEntryInput,
  actorId: string
) {
  await getIncidentById(incidentId);

  const entry = await prisma.incidentTimelineEntry.create({
    data: {
      incidentId,
      type: TimelineEntryType.NOTE,
      message: input.message,
      createdById: actorId
    },
    include: {
      createdBy: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    }
  });

  await writeAuditLog({
    actorId,
    action: "incident.timeline_note_added",
    entityType: "Incident",
    entityId: incidentId
  });

  return entry;
}

export async function assignIncident(
  incidentId: string,
  input: AssignIncidentInput,
  actorId: string
) {
  const [incident, owner] = await Promise.all([
    prisma.incident.findUnique({
      where: { id: incidentId }
    }),
    prisma.user.findUnique({
      where: { id: input.ownerId },
      select: { id: true, email: true, name: true }
    })
  ]);

  if (!incident) {
    throw new AppError(404, "incident_not_found", "The requested incident does not exist.");
  }

  if (!owner) {
    throw new AppError(404, "owner_not_found", "The assigned owner does not exist.");
  }

  const updatedIncident = await prisma.$transaction(async (tx) => {
    const updated = await tx.incident.update({
      where: { id: incidentId },
      data: { ownerId: input.ownerId }
    });

    await tx.incidentTimelineEntry.create({
      data: {
        incidentId,
        type: TimelineEntryType.ASSIGNMENT,
        message: `Incident assigned to ${owner.name}.`,
        createdById: actorId
      }
    });

    await writeAuditLog(
      {
        actorId,
        action: "incident.assigned",
        entityType: "Incident",
        entityId: incidentId,
        metadata: {
          fromOwnerId: incident.ownerId,
          toOwnerId: input.ownerId
        }
      },
      tx
    );

    return updated;
  });

  return getIncidentById(updatedIncident.id);
}

