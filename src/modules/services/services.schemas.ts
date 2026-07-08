import { ServiceStatus } from "@prisma/client";
import { z } from "zod";

export const serviceIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const createServiceSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .optional(),
  description: z.string().trim().max(500).optional()
});

export const updateServiceStatusSchema = z.object({
  status: z.nativeEnum(ServiceStatus)
});

export type CreateServiceInput = z.infer<typeof createServiceSchema>;
export type UpdateServiceStatusInput = z.infer<typeof updateServiceStatusSchema>;

