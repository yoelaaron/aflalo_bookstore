import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { OrdersService } from "./orders.service";
import { OrdersResolver } from "./orders.resolver";
import { StripeService } from "./services/stripe.service";
import { EmailService } from "./services/email.service";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import { CartsModule } from "../carts/carts.module";
import { BooksModule } from "../books/books.module";
import { UsersModule } from "../users/users.module";
import { StripeWebhookController } from "./controllers/stripe-webhook.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    CartsModule,
    BooksModule,
    UsersModule,
  ],
  controllers: [StripeWebhookController],
  providers: [OrdersService, OrdersResolver, StripeService, EmailService],
  exports: [OrdersService, StripeService],
})
export class OrdersModule {}
