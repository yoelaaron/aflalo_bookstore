import { Resolver, Query, Mutation, Args } from "@nestjs/graphql";
import { OrdersService } from "./orders.service";
import {
  OrderType,
  CreateOrderInput,
  RefundOrderInput,
  PaymentIntentResponse,
  OrderSummary,
} from "./types/order.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { User } from "../users/entities/user.entity";

@Resolver(() => OrderType)
export class OrdersResolver {
  constructor(private readonly ordersService: OrdersService) {}

  @Query(() => [OrderType], { description: "Get current user orders" })
  async myOrders(@CurrentUser() user: User): Promise<OrderType[]> {
    return this.ordersService.findByUser(user.id);
  }

  @Query(() => OrderType, { description: "Get order by ID" })
  async order(
    @Args("id") id: string,
    @CurrentUser() user: User
  ): Promise<OrderType> {
    const order = await this.ordersService.findById(id);

    if (order.userId !== user.id) {
      throw new Error("Access denied");
    }

    return order;
  }

  @Query(() => OrderSummary, { description: "Get user order summary" })
  async orderSummary(@CurrentUser() user: User): Promise<OrderSummary> {
    return this.ordersService.getOrderSummary(user.id);
  }

  @Mutation(() => PaymentIntentResponse, {
    description: "Create payment intent for checkout",
  })
  async createPaymentIntent(
    @Args("input") createOrderInput: CreateOrderInput,
    @CurrentUser() user: User
  ): Promise<PaymentIntentResponse> {
    return this.ordersService.createPaymentIntent(createOrderInput, user.id);
  }

  @Mutation(() => OrderType, {
    description: "Confirm payment and complete order",
  })
  async confirmPayment(
    @Args("orderId") orderId: string,
    @CurrentUser() user: User
  ): Promise<OrderType> {
    return this.ordersService.confirmPayment(orderId, user.id);
  }

  @Mutation(() => OrderType, { description: "Request refund for an order" })
  async requestRefund(
    @Args("input") refundOrderInput: RefundOrderInput,
    @CurrentUser() user: User
  ): Promise<OrderType> {
    return this.ordersService.requestRefund(refundOrderInput, user.id);
  }
}
