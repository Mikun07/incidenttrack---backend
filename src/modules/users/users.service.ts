import { UserRole } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import { AppError } from "../../middleware/error-handler.js";
import { writeAuditLog } from "../audit/audit.service.js";
import type { UpdateUserRoleInput } from "./users.schemas.js";

const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  createdAt: true,
  updatedAt: true
};

export function listUsers() {
  return prisma.user.findMany({
    select: publicUserSelect,
    orderBy: { createdAt: "desc" }
  });
}

export async function updateUserRole(userId: string, input: UpdateUserRoleInput, actorId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true }
  });

  if (!user) {
    throw new AppError(404, "user_not_found", "The requested user does not exist.");
  }

  if (user.role === UserRole.ADMIN && input.role !== UserRole.ADMIN) {
    const adminCount = await prisma.user.count({ where: { role: UserRole.ADMIN } });

    if (adminCount <= 1) {
      throw new AppError(409, "last_admin_required", "At least one admin user must remain.");
    }
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: userId },
      data: { role: input.role },
      select: publicUserSelect
    });

    await writeAuditLog(
      {
        actorId,
        action: "user.role_updated",
        entityType: "User",
        entityId: userId,
        metadata: {
          fromRole: user.role,
          toRole: input.role
        }
      },
      tx
    );

    return updated;
  });

  return updatedUser;
}

