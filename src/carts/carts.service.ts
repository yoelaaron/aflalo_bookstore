import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Cart, CartStatus } from "./entities/cart.entity";
import { CartItem } from "./entities/cart-item.entity";
import {
  AddToCartInput,
  UpdateCartItemInput,
  CartSummary,
} from "./types/cart.types";
import { BooksService } from "../books/books.service";

@Injectable()
export class CartsService {
  constructor(
    @InjectRepository(Cart)
    private cartsRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private cartItemsRepository: Repository<CartItem>,
    private booksService: BooksService
  ) {}

  async getOrCreateActiveCart(userId: string): Promise<Cart> {
    let activeCart = await this.cartsRepository.findOne({
      where: {
        userId,
        status: CartStatus.ACTIVE,
      },
      relations: ["items", "items.book"],
    });

    if (!activeCart) {
      activeCart = await this.createActiveCart(userId);
    }

    return activeCart;
  }

  private async createActiveCart(userId: string): Promise<Cart> {
    const existingActiveCart = await this.cartsRepository.findOne({
      where: { userId, status: CartStatus.ACTIVE },
    });

    if (existingActiveCart) {
      throw new ConflictException("User already has an active cart");
    }

    const cart = this.cartsRepository.create({
      userId,
      status: CartStatus.ACTIVE,
      totalAmount: 0,
    });

    const savedCart = await this.cartsRepository.save(cart);

    return this.cartsRepository.findOne({
      where: { id: savedCart.id },
      relations: ["items", "items.book"],
    });
  }

  async addToCart(
    addToCartInput: AddToCartInput,
    userId: string
  ): Promise<Cart> {
    const { bookId, quantity } = addToCartInput;

    const cart = await this.getOrCreateActiveCart(userId);

    const book = await this.booksService.findById(bookId);

    if (!book.isActive) {
      throw new BadRequestException("Book is not available");
    }

    if (book.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${book.stock}`
      );
    }

    const existingItem = cart.items?.find((item) => item.bookId === bookId);

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (book.stock < newQuantity) {
        throw new BadRequestException(
          `Insufficient stock. Available: ${book.stock}, Requested: ${newQuantity}`
        );
      }

      return this.updateCartItemQuantity(existingItem.id, newQuantity, userId);
    } else {
      const cartItem = this.cartItemsRepository.create({
        cartId: cart.id,
        bookId,
        quantity,
        unitPrice: book.price,
        totalPrice: book.price * quantity,
      });

      await this.cartItemsRepository.save(cartItem);
      return this.recalculateCartTotal(cart.id);
    }
  }

  async updateCartItemQuantity(
    cartItemId: string,
    quantity: number,
    userId: string
  ): Promise<Cart> {
    const cartItem = await this.cartItemsRepository.findOne({
      where: { id: cartItemId },
      relations: ["cart", "book"],
    });

    if (!cartItem) {
      throw new NotFoundException("Cart item not found");
    }

    if (cartItem.cart.userId !== userId) {
      throw new ForbiddenException("Access denied");
    }

    if (cartItem.cart.status !== CartStatus.ACTIVE) {
      throw new BadRequestException("Cannot modify non-active cart");
    }

    if (cartItem.book.stock < quantity) {
      throw new BadRequestException(
        `Insufficient stock. Available: ${cartItem.book.stock}`
      );
    }

    await this.cartItemsRepository.update(cartItemId, {
      quantity,
      totalPrice: cartItem.unitPrice * quantity,
    });

    return this.recalculateCartTotal(cartItem.cartId);
  }

  async removeFromCart(cartItemId: string, userId: string): Promise<Cart> {
    const cartItem = await this.cartItemsRepository.findOne({
      where: { id: cartItemId },
      relations: ["cart"],
    });

    if (!cartItem) {
      throw new NotFoundException("Cart item not found");
    }

    if (cartItem.cart.userId !== userId) {
      throw new ForbiddenException("Access denied");
    }

    if (cartItem.cart.status !== CartStatus.ACTIVE) {
      throw new BadRequestException("Cannot modify non-active cart");
    }

    await this.cartItemsRepository.delete(cartItemId);
    return this.recalculateCartTotal(cartItem.cartId);
  }

  async clearCart(userId: string): Promise<Cart> {
    const cart = await this.getOrCreateActiveCart(userId);

    await this.cartItemsRepository.delete({ cartId: cart.id });

    await this.cartsRepository.update(cart.id, { totalAmount: 0 });

    return this.cartsRepository.findOne({
      where: { id: cart.id },
      relations: ["items", "items.book"],
    });
  }

  async getCartSummary(userId: string): Promise<CartSummary> {
    const cart = await this.getOrCreateActiveCart(userId);

    const totalItems =
      cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const uniqueBooks = cart.items?.length || 0;

    return {
      totalItems,
      totalAmount: cart.totalAmount,
      uniqueBooks,
    };
  }

  async getCartHistory(userId: string): Promise<Cart[]> {
    return this.cartsRepository.find({
      where: { userId },
      relations: ["items", "items.book"],
      order: { createdAt: "DESC" },
    });
  }

  async markCartAsPaid(cartId: string): Promise<void> {
    await this.cartsRepository.update(cartId, {
      status: CartStatus.PAID,
    });
  }

  private async recalculateCartTotal(cartId: string): Promise<Cart> {
    const cart = await this.cartsRepository.findOne({
      where: { id: cartId },
      relations: ["items", "items.book"],
    });

    const totalAmount =
      cart.items?.reduce((sum, item) => sum + item.totalPrice, 0) || 0;

    await this.cartsRepository.update(cartId, { totalAmount });

    return this.cartsRepository.findOne({
      where: { id: cartId },
      relations: ["items", "items.book"],
    });
  }

  async validateCartForCheckout(
    userId: string
  ): Promise<{ valid: boolean; errors: string[] }> {
    const cart = await this.getOrCreateActiveCart(userId);
    const errors: string[] = [];

    if (!cart.items || cart.items.length === 0) {
      errors.push("Cart is empty");
    }

    for (const item of cart.items || []) {
      const book = await this.booksService.findById(item.bookId);

      if (!book.isActive) {
        errors.push(`Book "${book.title}" is no longer available`);
      }

      if (book.stock < item.quantity) {
        errors.push(
          `Insufficient stock for "${book.title}". Available: ${book.stock}, In cart: ${item.quantity}`
        );
      }

      if (Math.abs(book.price - item.unitPrice) > 0.01) {
        errors.push(
          `Price changed for "${book.title}". Current: ${book.price}, In cart: ${item.unitPrice}`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
