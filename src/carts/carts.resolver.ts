import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from "@nestjs/graphql";
import { CartsService } from "./carts.service";
import {
  CartType,
  CartItemType,
  AddToCartInput,
  UpdateCartItemInput,
  RemoveFromCartInput,
  CartSummary,
  CartValidation,
} from "./types/cart.types";
import { BookType } from "../books/types/book.types";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { User } from "../users/entities/user.entity";
import { BooksService } from "../books/books.service";

@Resolver(() => CartType)
export class CartsResolver {
  constructor(
    private readonly cartsService: CartsService,
    private readonly booksService: BooksService
  ) {}

  @Query(() => CartType, { description: "Get current user active cart" })
  async myCart(@CurrentUser() user: User): Promise<CartType> {
    return this.cartsService.getOrCreateActiveCart(user.id);
  }

  @Query(() => [CartType], { description: "Get user cart history" })
  async myCartHistory(@CurrentUser() user: User): Promise<CartType[]> {
    return this.cartsService.getCartHistory(user.id);
  }

  @Query(() => CartSummary, { description: "Get cart summary" })
  async cartSummary(@CurrentUser() user: User): Promise<CartSummary> {
    return this.cartsService.getCartSummary(user.id);
  }

  @Query(() => CartValidation, { description: "Validate cart for checkout" })
  async validateCart(@CurrentUser() user: User): Promise<CartValidation> {
    return this.cartsService.validateCartForCheckout(user.id);
  }

  @Mutation(() => CartType, { description: "Add item to cart" })
  async addToCart(
    @Args("input") addToCartInput: AddToCartInput,
    @CurrentUser() user: User
  ): Promise<CartType> {
    return this.cartsService.addToCart(addToCartInput, user.id);
  }

  @Mutation(() => CartType, { description: "Update cart item quantity" })
  async updateCartItem(
    @Args("input") updateCartItemInput: UpdateCartItemInput,
    @CurrentUser() user: User
  ): Promise<CartType> {
    const { cartItemId, quantity } = updateCartItemInput;
    return this.cartsService.updateCartItemQuantity(
      cartItemId,
      quantity,
      user.id
    );
  }

  @Mutation(() => CartType, { description: "Remove item from cart" })
  async removeFromCart(
    @Args("input") removeFromCartInput: RemoveFromCartInput,
    @CurrentUser() user: User
  ): Promise<CartType> {
    const { cartItemId } = removeFromCartInput;
    return this.cartsService.removeFromCart(cartItemId, user.id);
  }

  @Mutation(() => CartType, { description: "Clear entire cart" })
  async clearCart(@CurrentUser() user: User): Promise<CartType> {
    return this.cartsService.clearCart(user.id);
  }
}

@Resolver(() => CartItemType)
export class CartItemResolver {
  constructor(private readonly booksService: BooksService) {}

  @ResolveField(() => BookType)
  async book(@Parent() cartItem: CartItemType): Promise<BookType> {
    return this.booksService.findById(cartItem.bookId);
  }
}
