import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    PORT: z.coerce.number().int().positive().default(4000),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32),
    JWT_EXPIRES_IN: z.string().default("1h"),
    CORS_ORIGIN: z.string().optional()
  })
  .superRefine((value, ctx) => {
    const corsOrigins = parseCorsOrigins(value.CORS_ORIGIN);

    if (value.NODE_ENV === "production" && corsOrigins.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["CORS_ORIGIN"],
        message: "CORS_ORIGIN is required in production to restrict cross-origin requests."
      });
    }
  });

function parseCorsOrigins(value: string | undefined) {
  return value
    ? value
        .split(",")
        .map((origin) => origin.trim())
        .filter(Boolean)
    : [];
}

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(`Invalid environment configuration: ${parsedEnv.error.message}`);
}

const corsOrigins = parseCorsOrigins(parsedEnv.data.CORS_ORIGIN);

export const env = {
  ...parsedEnv.data,
  CORS_ORIGINS:
    corsOrigins.length > 0 ? corsOrigins : ["http://localhost:5173", "http://localhost:3000"]
};
