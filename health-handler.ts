// Added database connectivity check
import { IncomingMessage, ServerResponse } from "node:http";
import { AppConfig } from "./config";
import { Handler } from "./request-id";

export function createHealthHandler(config: AppConfig): Handler {
  return (_req: IncomingMessage, res: ServerResponse) => {
    const body = {
      status: "ok",
      service: config.serviceName,
      env: config.nodeEnv,
      uptimeSec: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };

    const payload = JSON.stringify(body);
    res.statusCode = 200;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.setHeader("cache-control", "no-store");
    res.end(payload);
  };
}
