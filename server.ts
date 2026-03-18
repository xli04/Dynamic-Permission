// Updated: added graceful shutdown handling
import { createServer } from "node:http";
import { loadConfig } from "./config";
import { createHealthHandler } from "./health-handler";
import { Logger } from "./logger";
import { withRequestContext } from "./request-id";
import { Router } from "./router";

const config = loadConfig();
const logger = new Logger(config.serviceName, config.nodeEnv === "development" ? "debug" : "info");

const router = new Router();
router.register("GET", "/health", withRequestContext(createHealthHandler(config)));

const server = createServer(async (req, res) => {
  try {
    const handled = await router.handle(req, res, {
      requestId: "unknown",
      startedAtMs: Date.now(),
    });

    if (!handled) {
      res.statusCode = 404;
      res.setHeader("content-type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: "Not Found" }));
    }
  } catch (error) {
    logger.error("Unhandled request error", {
      error: error instanceof Error ? error.message : String(error),
      url: req.url,
      method: req.method,
    });

    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("content-type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: "Internal Server Error" }));
    }
  }
});

server.listen(config.port, config.host, () => {
  logger.info("HTTP server started", {
    host: config.host,
    port: config.port,
    env: config.nodeEnv,
  });
});

const shutdown = (signal: NodeJS.Signals): void => {
  logger.warn("Shutdown signal received", { signal });

  const timeout = setTimeout(() => {
    logger.error("Forced shutdown after timeout", {
      timeoutMs: config.shutdownTimeoutMs,
    });
    process.exit(1);
  }, config.shutdownTimeoutMs);

  timeout.unref();

  server.close((err) => {
    if (err) {
      logger.error("Error while closing server", { error: err.message });
      process.exit(1);
      return;
    }

    logger.info("Server stopped gracefully");
    process.exit(0);
  });
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
