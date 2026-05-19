import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { fail } from "./types/api.js";
import { env } from "./config/env.js";

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json());
  app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

  app.use("/api", routes);

  app.use((_req, res) => {
    res.status(404).json(fail("not_found", "Route not found"));
  });

  app.use(errorHandler);

  return app;
};
