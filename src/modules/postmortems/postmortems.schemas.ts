import { ActionItemStatus } from "@prisma/client";
import { z } from "zod";

export const postmortemIncidentParamsSchema = z.object({
  incidentId: z.string().uuid()
});

export const upsertPostmortemSchema = z.object({
  rootCause: z.string().trim().min(10).max(4000),
  impactSummary: z.string().trim().min(10).max(4000),
  detectionSummary: z.string().trim().min(10).max(4000),
  resolutionSummary: z.string().trim().min(10).max(4000),
  lessonsLearned: z.string().trim().min(10).max(4000),
  publish: z.boolean().default(false)
});

export const createActionItemSchema = z.object({
  title: z.string().trim().min(4).max(160),
  description: z.string().trim().max(1000).optional(),
  assigneeId: z.string().uuid().optional(),
  dueDate: z.coerce.date().optional()
});

export const updateActionItemStatusSchema = z.object({
  status: z.nativeEnum(ActionItemStatus)
});

export type UpsertPostmortemInput = z.infer<typeof upsertPostmortemSchema>;
export type CreateActionItemInput = z.infer<typeof createActionItemSchema>;
export type UpdateActionItemStatusInput = z.infer<typeof updateActionItemStatusSchema>;

