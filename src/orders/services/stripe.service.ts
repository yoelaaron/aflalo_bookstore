import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import Stripe from "stripe";

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(
      this.configService.get<string>("STRIPE_SECRET_KEY"),
      {
        apiVersion: "2023-10-16",
      }
    );
  }

  async createPaymentIntent(
    amount: number,
    currency: string = "usd",
    metadata?: any
  ): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        `Failed to create payment intent: ${error.message}`
      );
    }
  }

  async confirmPaymentIntent(
    paymentIntentId: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      throw new BadRequestException(
        `Failed to confirm payment intent: ${error.message}`
      );
    }
  }

  async createRefund(
    paymentIntentId: string,
    amount?: number,
    reason?: string
  ): Promise<Stripe.Refund> {
    try {
      const refundData: Stripe.RefundCreateParams = {
        payment_intent: paymentIntentId,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      if (reason) {
        refundData.reason = "requested_by_customer";
        refundData.metadata = { reason };
      }

      return await this.stripe.refunds.create(refundData);
    } catch (error) {
      throw new BadRequestException(
        `Failed to create refund: ${error.message}`
      );
    }
  }

  async getPaymentIntent(
    paymentIntentId: string
  ): Promise<Stripe.PaymentIntent> {
    try {
      return await this.stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve payment intent: ${error.message}`
      );
    }
  }

  async getRefund(refundId: string): Promise<Stripe.Refund> {
    try {
      return await this.stripe.refunds.retrieve(refundId);
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve refund: ${error.message}`
      );
    }
  }

  constructWebhookEvent(body: any, signature: string): Stripe.Event {
    const endpointSecret = this.configService.get<string>(
      "STRIPE_WEBHOOK_SECRET"
    );

    if (
      !endpointSecret ||
      this.configService.get("NODE_ENV") === "development"
    ) {
      console.warn(
        "⚠️ Webhook signature verification skipped (development mode)"
      );

      if (typeof body === "object" && body.type) {
        return body as Stripe.Event;
      }

      try {
        return JSON.parse(body) as Stripe.Event;
      } catch (error) {
        throw new BadRequestException("Invalid webhook payload");
      }
    }

    try {
      return this.stripe.webhooks.constructEvent(
        body,
        signature,
        endpointSecret
      );
    } catch (error) {
      throw new BadRequestException(
        `Webhook signature verification failed: ${error.message}`
      );
    }
  }
}
