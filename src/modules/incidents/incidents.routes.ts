import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { canModifyIncidents, canViewProtectedData, requireAuth } from "../../middleware/auth.js";
import { validateBody, validateParams, validateQuery } from "../../middleware/validate.js";
import {
  addTimelineEntry,
  assignIncident,
  createIncident,
  getIncidentById,
  listIncidents,
  transitionIncidentStatus
} from "./incidents.service.js";
import {
  addTimelineEntrySchema,
  assignIncidentSchema,
  createIncidentSchema,
  incidentIdParamsSchema,
  listIncidentsQuerySchema,
  transitionIncidentStatusSchema
} from "./incidents.schemas.js";

export const incidentsRouter = Router();

incidentsRouter.use(requireAuth, canViewProtectedData);

incidentsRouter.get(
  "/",
  validateQuery(listIncidentsQuerySchema),
  asyncHandler(async (req, res) => {
    const result = await listIncidents(req.query as never);
    res.json(result);
  })
);

incidentsRouter.post(
  "/",
  canModifyIncidents,
  validateBody(createIncidentSchema),
  asyncHandler(async (req, res) => {
    const incident = await createIncident(req.body, req.user!.id);
    res.status(201).json({ incident });
  })
);

incidentsRouter.get(
  "/:id",
  validateParams(incidentIdParamsSchema),
  asyncHandler(async (req, res) => {
    const incident = await getIncidentById(req.params.id);
    res.json({ incident });
  })
);

incidentsRouter.patch(
  "/:id/status",
  canModifyIncidents,
  validateParams(incidentIdParamsSchema),
  validateBody(transitionIncidentStatusSchema),
  asyncHandler(async (req, res) => {
    const incident = await transitionIncidentStatus(req.params.id, req.body, req.user!.id);
    res.json({ incident });
  })
);

incidentsRouter.post(
  "/:id/timeline",
  canModifyIncidents,
  validateParams(incidentIdParamsSchema),
  validateBody(addTimelineEntrySchema),
  asyncHandler(async (req, res) => {
    const timelineEntry = await addTimelineEntry(req.params.id, req.body, req.user!.id);
    res.status(201).json({ timelineEntry });
  })
);

incidentsRouter.post(
  "/:id/assign",
  canModifyIncidents,
  validateParams(incidentIdParamsSchema),
  validateBody(assignIncidentSchema),
  asyncHandler(async (req, res) => {
    const incident = await assignIncident(req.params.id, req.body, req.user!.id);
    res.json({ incident });
  })
);

