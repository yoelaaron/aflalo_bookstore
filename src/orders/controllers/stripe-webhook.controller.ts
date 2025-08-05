import {
  Controller,
  Post,
  Headers,
  HttpCode,
  HttpStatus,
  Req,
  BadRequestException,
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
    @Req() req: Request,
    @Headers("stripe-signature") signature: string
  ): Promise<{ received: boolean }> {
    if (!signature) {
      throw new BadRequestException("Missing stripe-signature header");
    }

    try {
      const rawBody = req.body;

      if (!rawBody) {
        throw new BadRequestException("Missing request body");
      }

      console.log("Webhook received, body type:", typeof rawBody);
      console.log("Signature present:", !!signature);

      const event = this.stripeService.constructWebhookEvent(
        rawBody,
        signature
      );

      console.log("Webhook event type:", event.type);
      console.log("Webhook event ID:", event.id);

      await this.ordersService.handleStripeWebhook(event);

      return { received: true };
    } catch (error) {
      console.error("Webhook error:", error.message);
      throw new BadRequestException(`Webhook error: ${error.message}`);
    }
  }
}
