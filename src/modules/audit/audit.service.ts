import type { Prisma, PrismaClient } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

type AuditClient = Prisma.TransactionClient | PrismaClient;

type AuditInput = {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Prisma.InputJsonValue;
};

export function writeAuditLog(input: AuditInput, client: AuditClient = prisma) {
  return client.auditLog.create({
    data: {
      actorId: input.actorId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata
    }
  });
}

