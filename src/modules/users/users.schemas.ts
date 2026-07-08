import { UserRole } from "@prisma/client";
import { z } from "zod";

export const userIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const updateUserRoleSchema = z.object({
  role: z.nativeEnum(UserRole)
});

export type UpdateUserRoleInput = z.infer<typeof updateUserRoleSchema>;

