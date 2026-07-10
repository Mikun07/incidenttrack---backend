import cors from "cors";
import express from "express";
import helmet from "helmet";
import { env } from "./config/env.js";
import { apiRouter } from "./modules/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.js";
import { prisma } from "./lib/prisma.js";

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGINS,
      credentials: true
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "incidenttrack-backend",
      timestamp: new Date().toISOString()
    });
  });

  app.get("/health/ready", async (_req, res) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({
        status: "ok",
        service: "incidenttrack-backend",
        database: "connected",
        timestamp: new Date().toISOString()
      });
    } catch {
      res.status(503).json({
        status: "unavailable",
        service: "incidenttrack-backend",
        database: "unreachable",
        timestamp: new Date().toISOString()
      });
    }
  });

  app.use("/api", apiRouter);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

