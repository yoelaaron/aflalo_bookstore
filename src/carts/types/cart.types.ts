import {
  ObjectType,
  Field,
  InputType,
  ID,
  Float,
  Int,
  registerEnumType,
} from "@nestjs/graphql";
import { IsString, IsNumber, IsOptional, Min, IsUUID } from "class-validator";
import { CartStatus } from "../entities/cart.entity";

registerEnumType(CartStatus, {
  name: "CartStatus",
  description: "The status of a cart",
});

@ObjectType()
export class CartItemType {
  @Field(() => ID)
  id: string;

  @Field(() => Int)
  quantity: number;

  @Field(() => Float)
  unitPrice: number;

  @Field(() => Float)
  totalPrice: number;

  @Field()
  cartId: string;

  @Field()
  bookId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}

@ObjectType()
export class CartType {
  @Field(() => ID)
  id: string;

  @Field(() => CartStatus)
  status: CartStatus;

  @Field(() => Float)
  totalAmount: number;

  @Field()
  userId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [CartItemType])
  items: CartItemType[];
}

@InputType()
export class AddToCartInput {
  @Field(() => ID)
  @IsUUID()
  bookId: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantity: number;
}

@InputType()
export class UpdateCartItemInput {
  @Field(() => ID)
  @IsUUID()
  cartItemId: string;

  @Field(() => Int)
  @IsNumber()
  @Min(1)
  quantity: number;
}

@InputType()
export class RemoveFromCartInput {
  @Field(() => ID)
  @IsUUID()
  cartItemId: string;
}

@ObjectType()
export class CartSummary {
  @Field(() => Int)
  totalItems: number;

  @Field(() => Float)
  totalAmount: number;

  @Field(() => Int)
  uniqueBooks: number;
}

@ObjectType()
export class CartValidation {
  @Field()
  valid: boolean;

  @Field(() => [String])
  errors: string[];
}
