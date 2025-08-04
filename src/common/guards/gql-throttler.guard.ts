import { ExecutionContext, Injectable } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { ThrottlerGuard } from "@nestjs/throttler";

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();

    const req = ctx?.req || {
      ip: "unknown",
      headers: {},
      connection: { remoteAddress: "unknown" },
      socket: { remoteAddress: "unknown" },
    };

    const res = ctx?.res || {};

    return { req, res };
  }

  protected async getTracker(req: Record<string, any>): Promise<string> {
    const userAgent = req?.headers?.["user-agent"] || "unknown";
    const timestamp = Math.floor(Date.now() / 60000); // Groupe par minute

    return `${userAgent}-${timestamp}`;
  }
}
