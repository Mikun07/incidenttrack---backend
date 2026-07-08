import { Router } from "express";
import { asyncHandler } from "../../lib/async-handler.js";
import { canModifyIncidents, canViewProtectedData, requireAuth } from "../../middleware/auth.js";
import { validateBody, validateParams } from "../../middleware/validate.js";
import { createService, getServiceById, listServices, updateServiceStatus } from "./services.service.js";
import {
  createServiceSchema,
  serviceIdParamsSchema,
  updateServiceStatusSchema
} from "./services.schemas.js";

export const servicesRouter = Router();

servicesRouter.use(requireAuth, canViewProtectedData);

servicesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    const services = await listServices();
    res.json({ services });
  })
);

servicesRouter.post(
  "/",
  canModifyIncidents,
  validateBody(createServiceSchema),
  asyncHandler(async (req, res) => {
    const service = await createService(req.body, req.user!.id);
    res.status(201).json({ service });
  })
);

servicesRouter.get(
  "/:id",
  validateParams(serviceIdParamsSchema),
  asyncHandler(async (req, res) => {
    const service = await getServiceById(req.params.id);
    res.json({ service });
  })
);

servicesRouter.patch(
  "/:id/status",
  canModifyIncidents,
  validateParams(serviceIdParamsSchema),
  validateBody(updateServiceStatusSchema),
  asyncHandler(async (req, res) => {
    const service = await updateServiceStatus(req.params.id, req.body, req.user!.id);
    res.json({ service });
  })
);

