import {
  ObjectType,
  Field,
  InputType,
  ID,
  Float,
  Int,
  registerEnumType,
} from "@nestjs/graphql";
import { IsString, IsOptional, IsUUID, MaxLength } from "class-validator";
import { OrderStatus } from "../entities/order.entity";

registerEnumType(OrderStatus, {
  name: "OrderStatus",
  description: "The status of an order",
});

@ObjectType()
export class OrderItemType {
  @Field(() => ID)
  id: string;

  @Field()
  bookTitle: string;

  @Field()
  bookAuthor: string;

  @Field({ nullable: true })
  bookIsbn?: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  unitPrice: number;

  @Field(() => Float)
  totalPrice: number;

  @Field()
  bookId: string;

  @Field()
  orderId: string;

  @Field()
  createdAt: Date;
}

@ObjectType()
export class OrderType {
  @Field(() => ID)
  id: string;

  @Field()
  orderNumber: string;

  @Field(() => OrderStatus)
  status: OrderStatus;

  @Field(() => Float)
  totalAmount: number;

  @Field({ nullable: true })
  stripePaymentIntentId?: string;

  @Field({ nullable: true })
  stripeRefundId?: string;

  @Field({ nullable: true })
  paidAt?: Date;

  @Field({ nullable: true })
  refundedAt?: Date;

  @Field({ nullable: true })
  refundReason?: string;

  @Field()
  userId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [OrderItemType])
  items: OrderItemType[];
}

@InputType()
export class CreateOrderInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

@InputType()
export class RefundOrderInput {
  @Field(() => ID)
  @IsUUID()
  orderId: string;

  @Field()
  @IsString()
  @MaxLength(500)
  reason: string;
}

@ObjectType()
export class PaymentIntentResponse {
  @Field()
  clientSecret: string;

  @Field()
  orderId: string;
}

@ObjectType()
export class OrderSummary {
  @Field(() => Int)
  totalOrders: number;

  @Field(() => Float)
  totalSpent: number;

  @Field(() => Int)
  pendingOrders: number;

  @Field(() => Int)
  paidOrders: number;

  @Field(() => Int)
  refundedOrders: number;
}
