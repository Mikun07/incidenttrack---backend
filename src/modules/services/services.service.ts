import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error-handler.js";
import { writeAuditLog } from "../audit/audit.service.js";
import type { CreateServiceInput, UpdateServiceStatusInput } from "./services.schemas.js";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function listServices() {
  return prisma.service.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { incidents: true }
      }
    }
  });
}

export async function getServiceById(serviceId: string) {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      incidents: {
        orderBy: { openedAt: "desc" },
        take: 10
      }
    }
  });

  if (!service) {
    throw new AppError(404, "service_not_found", "The requested service does not exist.");
  }

  return service;
}

export async function createService(input: CreateServiceInput, actorId: string) {
  const slug = input.slug ?? slugify(input.name);

  if (!slug) {
    throw new AppError(400, "invalid_service_slug", "The service name could not produce a valid slug.");
  }

  const service = await prisma.$transaction(async (tx) => {
    const created = await tx.service.create({
      data: {
        name: input.name,
        slug,
        description: input.description
      }
    });

    await writeAuditLog(
      {
        actorId,
        action: "service.created",
        entityType: "Service",
        entityId: created.id,
        metadata: { slug: created.slug }
      },
      tx
    );

    return created;
  });

  return service;
}

export async function updateServiceStatus(
  serviceId: string,
  input: UpdateServiceStatusInput,
  actorId: string
) {
  const existingService = await prisma.service.findUnique({
    where: { id: serviceId }
  });

  if (!existingService) {
    throw new AppError(404, "service_not_found", "The requested service does not exist.");
  }

  const service = await prisma.$transaction(async (tx) => {
    const updated = await tx.service.update({
      where: { id: serviceId },
      data: { status: input.status }
    });

    await writeAuditLog(
      {
        actorId,
        action: "service.status_updated",
        entityType: "Service",
        entityId: serviceId,
        metadata: {
          fromStatus: existingService.status,
          toStatus: input.status
        }
      },
      tx
    );

    return updated;
  });

  return service;
}

