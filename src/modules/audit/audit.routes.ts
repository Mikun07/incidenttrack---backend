import { UserRole } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { asyncHandler } from "../../lib/async-handler.js";
import { prisma } from "../../lib/prisma.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validateQuery } from "../../middleware/validate.js";

export const auditRouter = Router();

const auditQuerySchema = z.object({
  entityType: z.string().trim().min(2).max(80).optional(),
  entityId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50)
});

auditRouter.use(requireAuth, requireRole(UserRole.ADMIN));

auditRouter.get(
  "/logs",
  validateQuery(auditQuerySchema),
  asyncHandler(async (req, res) => {
    const query = req.query as unknown as z.infer<typeof auditQuerySchema>;
    const skip = (query.page - 1) * query.pageSize;

    const where = {
      entityType: query.entityType,
      entityId: query.entityId
    };

    const [logs, total] = await prisma.$transaction([
      prisma.auditLog.findMany({
        where,
        include: {
          actor: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: query.pageSize
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({
      logs,
      pagination: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: Math.ceil(total / query.pageSize)
      }
    });
  })
);

