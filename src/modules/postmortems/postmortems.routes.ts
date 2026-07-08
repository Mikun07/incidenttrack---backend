import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { canModifyIncidents, canViewProtectedData, requireAuth } from "../../middleware/auth.js";
import { validateBody, validateParams } from "../../middleware/validate.js";
import {
  createActionItem,
  getPostmortemByIncident,
  updateActionItemStatus,
  upsertPostmortem
} from "./postmortems.service.js";
import {
  createActionItemSchema,
  postmortemIncidentParamsSchema,
  updateActionItemStatusSchema,
  upsertPostmortemSchema
} from "./postmortems.schemas.js";
import { z } from "zod";

export const postmortemsRouter = Router();

const actionItemParamsSchema = z.object({
  id: z.string().uuid()
});

postmortemsRouter.use(requireAuth, canViewProtectedData);

postmortemsRouter.get(
  "/incidents/:incidentId/postmortem",
  validateParams(postmortemIncidentParamsSchema),
  asyncHandler(async (req, res) => {
    const postmortem = await getPostmortemByIncident(req.params.incidentId);
    res.json({ postmortem });
  })
);

postmortemsRouter.put(
  "/incidents/:incidentId/postmortem",
  canModifyIncidents,
  validateParams(postmortemIncidentParamsSchema),
  validateBody(upsertPostmortemSchema),
  asyncHandler(async (req, res) => {
    const postmortem = await upsertPostmortem(req.params.incidentId, req.body, req.user!.id);
    res.json({ postmortem });
  })
);

postmortemsRouter.post(
  "/incidents/:incidentId/action-items",
  canModifyIncidents,
  validateParams(postmortemIncidentParamsSchema),
  validateBody(createActionItemSchema),
  asyncHandler(async (req, res) => {
    const actionItem = await createActionItem(req.params.incidentId, req.body, req.user!.id);
    res.status(201).json({ actionItem });
  })
);

postmortemsRouter.patch(
  "/action-items/:id/status",
  canModifyIncidents,
  validateParams(actionItemParamsSchema),
  validateBody(updateActionItemStatusSchema),
  asyncHandler(async (req, res) => {
    const actionItem = await updateActionItemStatus(req.params.id, req.body, req.user!.id);
    res.json({ actionItem });
  })
);

