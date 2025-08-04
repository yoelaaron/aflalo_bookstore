import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Order, OrderStatus } from "./entities/order.entity";
import { OrderItem } from "./entities/order-item.entity";
import {
  CreateOrderInput,
  RefundOrderInput,
  OrderSummary,
} from "./types/order.types";
import { CartsService } from "../carts/carts.service";
import { BooksService } from "../books/books.service";
import { UsersService } from "../users/users.service";
import { StripeService } from "./services/stripe.service";
import { EmailService } from "./services/email.service";

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemsRepository: Repository<OrderItem>,
    private cartsService: CartsService,
    private booksService: BooksService,
    private usersService: UsersService,
    private stripeService: StripeService,
    private emailService: EmailService
  ) {}

  // Create payment intent (step 1 of checkout)
  async createPaymentIntent(
    createOrderInput: CreateOrderInput,
    userId: string
  ): Promise<{ clientSecret: string; orderId: string }> {
    // Validate cart
    const validation = await this.cartsService.validateCartForCheckout(userId);
    if (!validation.valid) {
      throw new BadRequestException(
        `Cart validation failed: ${validation.errors.join(", ")}`
      );
    }

    // Get cart
    const cart = await this.cartsService.getOrCreateActiveCart(userId);
    if (!cart.items || cart.items.length === 0) {
      throw new BadRequestException("Cart is empty");
    }

    // Create order from cart
    const orderNumber = this.generateOrderNumber();
    const order = this.ordersRepository.create({
      orderNumber,
      status: OrderStatus.PENDING,
      totalAmount: cart.totalAmount,
      userId,
    });

    const savedOrder = await this.ordersRepository.save(order);

    // Create order items
    const orderItems = cart.items.map((cartItem) =>
      this.orderItemsRepository.create({
        orderId: savedOrder.id,
        bookId: cartItem.bookId,
        bookTitle: cartItem.book.title,
        bookAuthor: cartItem.book.author,
        bookIsbn: cartItem.book.isbn,
        quantity: cartItem.quantity,
        unitPrice: cartItem.unitPrice,
        totalPrice: cartItem.totalPrice,
      })
    );

    await this.orderItemsRepository.save(orderItems);

    // Create Stripe payment intent
    const paymentIntent = await this.stripeService.createPaymentIntent(
      cart.totalAmount,
      "usd",
      {
        orderId: savedOrder.id,
        userId,
        orderNumber,
      }
    );

    // Update order with payment intent ID
    await this.ordersRepository.update(savedOrder.id, {
      stripePaymentIntentId: paymentIntent.id,
    });

    return {
      clientSecret: paymentIntent.client_secret,
      orderId: savedOrder.id,
    };
  }

  // Confirm payment and complete order (step 2 of checkout)
  async confirmPayment(orderId: string, userId: string): Promise<Order> {
    const order = await this.findById(orderId);

    // Verify ownership
    if (order.userId !== userId) {
      throw new ForbiddenException("Access denied");
    }

    // Verify order status
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException("Order is not in pending status");
    }

    // Verify payment with Stripe
    const paymentIntent = await this.stripeService.getPaymentIntent(
      order.stripePaymentIntentId
    );

    if (paymentIntent.status !== "succeeded") {
      throw new BadRequestException("Payment not completed");
    }

    // Update stock for all books
    for (const item of order.items) {
      await this.booksService.updateStock(item.bookId, item.quantity);
    }

    // Mark order as paid
    await this.ordersRepository.update(orderId, {
      status: OrderStatus.PAID,
      paidAt: new Date(),
    });

    // Mark cart as paid
    const cart = await this.cartsService.getOrCreateActiveCart(userId);
    await this.cartsService.markCartAsPaid(cart.id);

    // Get updated order
    const updatedOrder = await this.findById(orderId);

    // Send confirmation email
    const user = await this.usersService.findById(userId);
    await this.emailService.sendOrderConfirmationEmail(user, updatedOrder);

    return updatedOrder;
  }

  // Get order by ID
  async findById(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ["items"],
    });

    if (!order) {
      throw new NotFoundException("Order not found");
    }

    return order;
  }

  // Get user's orders
  async findByUser(userId: string): Promise<Order[]> {
    return this.ordersRepository.find({
      where: { userId },
      relations: ["items"],
      order: { createdAt: "DESC" },
    });
  }

  // Get all orders (admin function - not exposed in current API)
  async findAll(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ["items"],
      order: { createdAt: "DESC" },
    });
  }

  // Request refund
  async requestRefund(
    refundOrderInput: RefundOrderInput,
    userId: string
  ): Promise<Order> {
    const { orderId, reason } = refundOrderInput;

    const order = await this.findById(orderId);

    if (order.userId !== userId) {
      throw new ForbiddenException("Access denied");
    }

    if (order.status === OrderStatus.REFUNDED) {
      throw new BadRequestException("Order already refunded");
    }

    if (order.status !== OrderStatus.PAID) {
      throw new BadRequestException("Only paid orders can be refunded");
    }

    const refund = await this.stripeService.createRefund(
      order.stripePaymentIntentId,
      order.totalAmount,
      reason
    );

    // Update order
    await this.ordersRepository.update(orderId, {
      status: OrderStatus.REFUNDED,
      stripeRefundId: refund.id,
      refundedAt: new Date(),
      refundReason: reason,
    });

    // Restore stock (books back to inventory)
    for (const item of order.items) {
      const book = await this.booksService.findById(item.bookId);
      await this.booksService.updateStock(item.bookId, -item.quantity); // Negative quantity to add back
    }

    // Get updated order
    const updatedOrder = await this.findById(orderId);

    // Send refund confirmation email
    const user = await this.usersService.findById(userId);
    await this.emailService.sendRefundConfirmationEmail(user, updatedOrder);

    return updatedOrder;
  }

  // Get order summary for user
  async getOrderSummary(userId: string): Promise<OrderSummary> {
    const orders = await this.findByUser(userId);

    const totalOrders = orders.length;
    const totalSpent = orders
      .filter((order) => order.status === OrderStatus.PAID)
      .reduce((sum, order) => sum + order.totalAmount, 0);

    const pendingOrders = orders.filter(
      (order) => order.status === OrderStatus.PENDING
    ).length;
    const paidOrders = orders.filter(
      (order) => order.status === OrderStatus.PAID
    ).length;
    const refundedOrders = orders.filter(
      (order) => order.status === OrderStatus.REFUNDED
    ).length;

    return {
      totalOrders,
      totalSpent,
      pendingOrders,
      paidOrders,
      refundedOrders,
    };
  }

  // Generate unique order number
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `ORD-${timestamp}-${random}`;
  }

  // Handle Stripe webhooks (for additional security)
  async handleStripeWebhook(event: any): Promise<void> {
    switch (event.type) {
      case "payment_intent.succeeded":
        await this.handlePaymentSucceeded(event.data.object);
        break;
      case "payment_intent.payment_failed":
        await this.handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handlePaymentSucceeded(paymentIntent: any): Promise<void> {
    const order = await this.ordersRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (order && order.status === OrderStatus.PENDING) {
      // Additional verification from webhook
      console.log(`Payment succeeded for order ${order.orderNumber}`);
    }
  }

  private async handlePaymentFailed(paymentIntent: any): Promise<void> {
    const order = await this.ordersRepository.findOne({
      where: { stripePaymentIntentId: paymentIntent.id },
    });

    if (order && order.status === OrderStatus.PENDING) {
      await this.ordersRepository.update(order.id, {
        status: OrderStatus.CANCELLED,
      });
    }
  }
}
