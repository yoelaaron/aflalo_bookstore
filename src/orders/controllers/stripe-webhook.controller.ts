import {
  Controller,
  Post,
  Body,
  Headers,
  HttpCode,
  HttpStatus,
  RawBodyRequest,
  Req,
} from "@nestjs/common";
import { Request } from "express";
import { Public } from "../../auth/decorators/public.decorator";
import { StripeService } from "../services/stripe.service";
import { OrdersService } from "../orders.service";

@Controller("webhooks")
export class StripeWebhookController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly ordersService: OrdersService
  ) {}

  @Public()
  @Post("stripe")
  @HttpCode(HttpStatus.OK)
  async handleStripeWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature: string
  ): Promise<{ received: boolean }> {
    try {
      const event = this.stripeService.constructWebhookEvent(
        req.body,
        signature
      );
      await this.ordersService.handleStripeWebhook(event);

      return { received: true };
    } catch (error) {
      console.error("Webhook error:", error.message);
      throw error;
    }
  }
}
