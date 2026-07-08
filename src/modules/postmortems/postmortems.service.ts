import { IncidentStatus, TimelineEntryType } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error-handler.js";
import { writeAuditLog } from "../audit/audit.service.js";
import type {
  CreateActionItemInput,
  UpdateActionItemStatusInput,
  UpsertPostmortemInput
} from "./postmortems.schemas.js";

function canCreatePostmortem(status: IncidentStatus) {
  return status === IncidentStatus.RESOLVED || status === IncidentStatus.REVIEWED;
}

export async function getPostmortemByIncident(incidentId: string) {
  const postmortem = await prisma.postmortem.findUnique({
    where: { incidentId },
    include: {
      author: {
        select: {
          id: true,
          email: true,
          name: true
        }
      },
      actionItems: {
        include: {
          assignee: {
            select: {
              id: true,
              email: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: "asc" }
      }
    }
  });

  if (!postmortem) {
    throw new AppError(404, "postmortem_not_found", "This incident does not have a postmortem yet.");
  }

  return postmortem;
}

export async function upsertPostmortem(
  incidentId: string,
  input: UpsertPostmortemInput,
  actorId: string
) {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    select: { id: true, status: true }
  });

  if (!incident) {
    throw new AppError(404, "incident_not_found", "The requested incident does not exist.");
  }

  if (!canCreatePostmortem(incident.status)) {
    throw new AppError(
      409,
      "incident_not_ready_for_postmortem",
      "A postmortem can only be created after an incident is resolved."
    );
  }

  const publishedAt = input.publish ? new Date() : null;

  const postmortem = await prisma.$transaction(async (tx) => {
    const saved = await tx.postmortem.upsert({
      where: { incidentId },
      update: {
        rootCause: input.rootCause,
        impactSummary: input.impactSummary,
        detectionSummary: input.detectionSummary,
        resolutionSummary: input.resolutionSummary,
        lessonsLearned: input.lessonsLearned,
        publishedAt
      },
      create: {
        incidentId,
        authorId: actorId,
        rootCause: input.rootCause,
        impactSummary: input.impactSummary,
        detectionSummary: input.detectionSummary,
        resolutionSummary: input.resolutionSummary,
        lessonsLearned: input.lessonsLearned,
        publishedAt
      }
    });

    await tx.incidentTimelineEntry.create({
      data: {
        incidentId,
        type: TimelineEntryType.ROOT_CAUSE,
        message: input.publish ? "Postmortem published." : "Postmortem draft saved.",
        createdById: actorId
      }
    });

    await writeAuditLog(
      {
        actorId,
        action: input.publish ? "postmortem.published" : "postmortem.saved",
        entityType: "Postmortem",
        entityId: saved.id,
        metadata: { incidentId }
      },
      tx
    );

    return saved;
  });

  return postmortem;
}

export async function createActionItem(
  incidentId: string,
  input: CreateActionItemInput,
  actorId: string
) {
  const incident = await prisma.incident.findUnique({
    where: { id: incidentId },
    include: { postmortem: true }
  });

  if (!incident) {
    throw new AppError(404, "incident_not_found", "The requested incident does not exist.");
  }

  if (input.assigneeId) {
    const assignee = await prisma.user.findUnique({
      where: { id: input.assigneeId },
      select: { id: true }
    });

    if (!assignee) {
      throw new AppError(404, "assignee_not_found", "The assigned user does not exist.");
    }
  }

  const actionItem = await prisma.$transaction(async (tx) => {
    const created = await tx.actionItem.create({
      data: {
        incidentId,
        postmortemId: incident.postmortem?.id,
        title: input.title,
        description: input.description,
        assigneeId: input.assigneeId,
        dueDate: input.dueDate
      }
    });

    await tx.incidentTimelineEntry.create({
      data: {
        incidentId,
        type: TimelineEntryType.ACTION_ITEM_CREATED,
        message: `Action item created: ${input.title}`,
        createdById: actorId
      }
    });

    await writeAuditLog(
      {
        actorId,
        action: "action_item.created",
        entityType: "ActionItem",
        entityId: created.id,
        metadata: { incidentId, assigneeId: input.assigneeId }
      },
      tx
    );

    return created;
  });

  return actionItem;
}

export async function updateActionItemStatus(
  actionItemId: string,
  input: UpdateActionItemStatusInput,
  actorId: string
) {
  const actionItem = await prisma.actionItem.findUnique({
    where: { id: actionItemId }
  });

  if (!actionItem) {
    throw new AppError(404, "action_item_not_found", "The requested action item does not exist.");
  }

  const updatedActionItem = await prisma.$transaction(async (tx) => {
    const updated = await tx.actionItem.update({
      where: { id: actionItemId },
      data: { status: input.status }
    });

    await writeAuditLog(
      {
        actorId,
        action: "action_item.status_updated",
        entityType: "ActionItem",
        entityId: actionItemId,
        metadata: {
          fromStatus: actionItem.status,
          toStatus: input.status
        }
      },
      tx
    );

    return updated;
  });

  return updatedActionItem;
}

