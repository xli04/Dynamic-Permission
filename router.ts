import { IncomingMessage, ServerResponse } from "node:http";
import { Handler, RequestContext } from "./request-id";

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RouteKey = `${Method} ${string}`;

export class Router {
  private readonly routes = new Map<RouteKey, Handler>();

  register(method: Method, path: string, handler: Handler): void {
    this.routes.set(`${method} ${path}`, handler);
  }

  async handle(req: IncomingMessage, res: ServerResponse, ctx: RequestContext): Promise<boolean> {
    const method = (req.method || "GET") as Method;
    const url = req.url || "/";
    const key: RouteKey = `${method} ${url}`;
    const route = this.routes.get(key);

    if (!route) return false;

    await route(req, res, ctx);
    return true;
  }
}
