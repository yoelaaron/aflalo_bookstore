import { Injectable, ExecutionContext } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { ThrottlerGuard, ThrottlerException } from "@nestjs/throttler";

@Injectable()
export class GqlThrottlerGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext) {
    const gqlCtx = GqlExecutionContext.create(context);
    const ctx = gqlCtx.getContext();
    return { req: ctx.req, res: ctx.res };
  }

  protected async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
    throttler: any
  ): Promise<boolean> {
    const { req, res } = this.getRequestResponse(context);

    const key = this.generateKey(
      context,
      req.ip || req.connection.remoteAddress,
      throttler.name
    );
    const { totalHits, timeToExpire } = await this.storageService.increment(
      key,
      ttl
    );

    if (totalHits > limit) {
      if (res && typeof res.header === "function") {
        res.header("X-RateLimit-Limit", limit);
        res.header("X-RateLimit-Remaining", Math.max(0, limit - totalHits));
        res.header(
          "X-RateLimit-Reset",
          new Date(Date.now() + timeToExpire * 1000)
        );
      }

      throw new ThrottlerException();
    }

    if (res && typeof res.header === "function") {
      res.header("X-RateLimit-Limit", limit);
      res.header("X-RateLimit-Remaining", Math.max(0, limit - totalHits));
      res.header(
        "X-RateLimit-Reset",
        new Date(Date.now() + timeToExpire * 1000)
      );
    }

    return true;
  }
}
