import "dotenv/config";

type DataSource = "mock" | "databricks";

interface AppEnv {
  port: number;
  nodeEnv: string;
  corsOrigin: string;
  dataSource: DataSource;
}

const port = Number(process.env.PORT ?? 4000);

export const env: AppEnv = {
  port: Number.isFinite(port) ? port : 4000,
  nodeEnv: process.env.NODE_ENV ?? "development",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  dataSource: (process.env.DATA_SOURCE as DataSource) ?? "mock",
};
