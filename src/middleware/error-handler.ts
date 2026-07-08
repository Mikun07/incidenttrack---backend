import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(404, "route_not_found", `Route ${req.method} ${req.path} was not found.`));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details
      }
    });
  }

  if (error instanceof ZodError) {
    return res.status(400).json({
      error: {
        code: "validation_failed",
        message: "The request did not match the required contract.",
        details: error.flatten()
      }
    });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return res.status(409).json({
      error: {
        code: "database_constraint_failed",
        message: "The requested change conflicts with existing data.",
        details: env.NODE_ENV === "development" ? error.meta : undefined
      }
    });
  }

  console.error(error);

  return res.status(500).json({
    error: {
      code: "internal_server_error",
      message: "The server could not complete the request."
    }
  });
}

