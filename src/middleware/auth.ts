import { UserRole } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt.js";
import { AppError } from "./error-handler.js";

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: UserRole;
};

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const authorizationHeader = req.header("authorization");

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return next(new AppError(401, "authentication_required", "A valid bearer token is required."));
  }

  try {
    const token = authorizationHeader.slice("Bearer ".length);
    const payload = verifyAccessToken(token);

    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role
    };

    return next();
  } catch {
    return next(new AppError(401, "invalid_token", "The provided authentication token is invalid."));
  }
}

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "authentication_required", "Authentication is required."));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError(403, "permission_denied", "You do not have permission to perform this action."));
    }

    return next();
  };
}

export const canModifyIncidents = requireRole(UserRole.ADMIN, UserRole.RESPONDER);
export const canViewProtectedData = requireRole(UserRole.ADMIN, UserRole.RESPONDER, UserRole.VIEWER);

