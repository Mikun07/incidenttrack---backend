import { Router } from "express";
import { auditRouter } from "./audit/audit.routes.js";
import { authRouter } from "./auth/auth.routes.js";
import { incidentsRouter } from "./incidents/incidents.routes.js";
import { postmortemsRouter } from "./postmortems/postmortems.routes.js";
import { servicesRouter } from "./services/services.routes.js";
import { usersRouter } from "./users/users.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/users", usersRouter);
apiRouter.use("/services", servicesRouter);
apiRouter.use("/incidents", incidentsRouter);
apiRouter.use("/", postmortemsRouter);
apiRouter.use("/audit", auditRouter);

