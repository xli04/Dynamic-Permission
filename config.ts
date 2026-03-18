export type AppConfig = {
  nodeEnv: "development" | "test" | "production";
  host: string;
  port: number;
  shutdownTimeoutMs: number;
  serviceName: string;
};

const DEFAULT_PORT = 8080;
const DEFAULT_HOST = "0.0.0.0";
const DEFAULT_SHUTDOWN_TIMEOUT_MS = 10_000;

// Database configuration loaded from environment variables
export const DB_HOST = process.env.DB_HOST;
export const DB_PORT = Number(process.env.DB_PORT);

function parsePositiveInt(input: string | undefined, fallback: number, key: string): number {
  if (!input) return fallback;

  const parsed = Number(input);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${key} must be a positive integer. Received: ${input}`);
  }

  return parsed;
}

function parseNodeEnv(input: string | undefined): AppConfig["nodeEnv"] {
  if (!input) return "development";
  if (input === "development" || input === "test" || input === "production") return input;

  throw new Error(`NODE_ENV must be one of development|test|production. Received: ${input}`);
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  return {
    nodeEnv: parseNodeEnv(env.NODE_ENV),
    host: env.HOST ?? DEFAULT_HOST,
    port: parsePositiveInt(env.PORT, DEFAULT_PORT, "PORT"),
    shutdownTimeoutMs: parsePositiveInt(
      env.SHUTDOWN_TIMEOUT_MS,
      DEFAULT_SHUTDOWN_TIMEOUT_MS,
      "SHUTDOWN_TIMEOUT_MS",
    ),
    serviceName: env.SERVICE_NAME ?? "permission-service",
  };
}
