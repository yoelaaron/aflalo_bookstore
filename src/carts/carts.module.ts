import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CartsService } from "./carts.service";
import { CartsResolver, CartItemResolver } from "./carts.resolver";
import { Cart } from "./entities/cart.entity";
import { CartItem } from "./entities/cart-item.entity";
import { BooksModule } from "../books/books.module";

@Module({
  imports: [TypeOrmModule.forFeature([Cart, CartItem]), BooksModule],
  providers: [CartsService, CartsResolver, CartItemResolver],
  exports: [CartsService],
})
export class CartsModule {}
