import { randomUUID } from "node:crypto";
import { IncomingMessage, ServerResponse } from "node:http";

export type RequestContext = {
  requestId: string;
  startedAtMs: number;
};

export type Handler = (
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RequestContext,
) => Promise<void> | void;

export function withRequestContext(handler: Handler): Handler {
  return async (req, res, ctx) => {
    const requestId = req.headers["x-request-id"]?.toString() || randomUUID();
    const nextCtx: RequestContext = {
      ...ctx,
      requestId,
      startedAtMs: Date.now(),
    };

    res.setHeader("x-request-id", requestId);
    await handler(req, res, nextCtx);
  };
}
