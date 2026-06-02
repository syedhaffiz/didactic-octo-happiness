import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { fail } from "./types/api.js";
import { env } from "./config/env.js";
import { openApiSpec } from "./openapi/spec.js";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json());
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

  // Helmet's default CSP blocks Swagger UI's inline scripts/styles. Relax CSP
  // only on the docs paths so the UI works without weakening it elsewhere.
  app.use(
    "/api/docs",
    helmet({ contentSecurityPolicy: false }),
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, {
      customSiteTitle: "IRM API – Swagger",
    }),
  );
  app.get("/api/openapi.json", (_req, res) => {
    res.json(openApiSpec);
  });

  app.use("/api", routes);

  app.use((_req, res) => {
    res.status(404).json(fail("not_found", "Route not found"));
  });

  app.use(errorHandler);

  return app;
};
