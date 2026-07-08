import { UserRole } from "@prisma/client";
import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { requireAuth, requireRole } from "../../middleware/auth.js";
import { validateBody, validateParams } from "../../middleware/validate.js";
import { listUsers, updateUserRole } from "./users.service.js";
import { updateUserRoleSchema, userIdParamsSchema } from "./users.schemas.js";

export const usersRouter = Router();

usersRouter.use(requireAuth, requireRole(UserRole.ADMIN));

usersRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const users = await listUsers();
    res.json({ users });
  })
);

usersRouter.patch(
  "/:id/role",
  validateParams(userIdParamsSchema),
  validateBody(updateUserRoleSchema),
  asyncHandler(async (req, res) => {
    const user = await updateUserRole(req.params.id, req.body, req.user!.id);
    res.json({ user });
  })
);

