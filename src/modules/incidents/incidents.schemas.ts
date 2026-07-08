import { IncidentSeverity, IncidentStatus } from "@prisma/client";
import { z } from "zod";

export const incidentIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const listIncidentsQuerySchema = z.object({
  status: z.nativeEnum(IncidentStatus).optional(),
  severity: z.nativeEnum(IncidentSeverity).optional(),
  serviceId: z.string().uuid().optional(),
  ownerId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export const createIncidentSchema = z.object({
  title: z.string().trim().min(4).max(160),
  summary: z.string().trim().min(10).max(2000),
  severity: z.nativeEnum(IncidentSeverity),
  serviceId: z.string().uuid(),
  ownerId: z.string().uuid().optional()
});

export const transitionIncidentStatusSchema = z.object({
  status: z.nativeEnum(IncidentStatus),
  message: z.string().trim().min(4).max(1000).optional()
});

export const addTimelineEntrySchema = z.object({
  message: z.string().trim().min(4).max(1000)
});

export const assignIncidentSchema = z.object({
  ownerId: z.string().uuid()
});

export type ListIncidentsQuery = z.infer<typeof listIncidentsQuerySchema>;
export type CreateIncidentInput = z.infer<typeof createIncidentSchema>;
export type TransitionIncidentStatusInput = z.infer<typeof transitionIncidentStatusSchema>;
export type AddTimelineEntryInput = z.infer<typeof addTimelineEntrySchema>;
export type AssignIncidentInput = z.infer<typeof assignIncidentSchema>;

