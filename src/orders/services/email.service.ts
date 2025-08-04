import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import { Order } from "../entities/order.entity";
import { User } from "../../users/entities/user.entity";

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.createTransporter();
  }

  private createTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>("MAIL_HOST"),
      port: this.configService.get<number>("MAIL_PORT"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: this.configService.get<string>("MAIL_USER"),
        pass: this.configService.get<string>("MAIL_PASS"),
      },
    });
  }

  async sendOrderConfirmationEmail(user: User, order: Order): Promise<void> {
    try {
      const subject = `Order Confirmation - ${order.orderNumber}`;
      const html = this.generateOrderConfirmationHtml(user, order);

      await this.transporter.sendMail({
        from: this.configService.get<string>("MAIL_FROM"),
        to: user.email,
        subject,
        html,
      });

      this.logger.log(
        `Order confirmation email sent to ${user.email} for order ${order.orderNumber}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to send order confirmation email: ${error.message}`
      );
      // Don't throw error - email failure shouldn't break the order process
    }
  }

  async sendRefundConfirmationEmail(user: User, order: Order): Promise<void> {
    try {
      const subject = `Refund Processed - ${order.orderNumber}`;
      const html = this.generateRefundConfirmationHtml(user, order);

      await this.transporter.sendMail({
        from: this.configService.get<string>("MAIL_FROM"),
        to: user.email,
        subject,
        html,
      });

      this.logger.log(
        `Refund confirmation email sent to ${user.email} for order ${order.orderNumber}`
      );
    } catch (error) {
      this.logger.error(
        `Failed to send refund confirmation email: ${error.message}`
      );
    }
  }

  private generateOrderConfirmationHtml(user: User, order: Order): string {
    const itemsHtml = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">${item.bookTitle}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">by ${item.bookAuthor}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${item.unitPrice.toFixed(2)}</td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">$${item.totalPrice.toFixed(2)}</td>
        </tr>
      `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmation</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #2c3e50;">📚 Order Confirmation</h1>
          
          <p>Dear ${user.email},</p>
          
          <p>Thank you for your order! We're excited to confirm that your order has been successfully processed.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Order Details</h2>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
          </div>
          
          <h3>Items Ordered:</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="background-color: #e9ecef;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Book</th>
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Author</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #ddd;">Qty</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Unit Price</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #ddd;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="text-align: right; font-size: 18px; font-weight: bold; margin: 20px 0;">
            Total: $${order.totalAmount.toFixed(2)}
          </div>
          
          <p>Your books will be processed and prepared for delivery. You will receive another email with tracking information once your order has been shipped.</p>
          
          <p>Thank you for choosing our bookstore!</p>
          
          <p>Best regards,<br>The Bookstore Team</p>
        </div>
      </body>
      </html>
    `;
  }

  private generateRefundConfirmationHtml(user: User, order: Order): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Refund Processed</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #dc3545;">💰 Refund Processed</h1>
          
          <p>Dear ${user.email},</p>
          
          <p>Your refund request has been processed successfully.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Refund Details</h2>
            <p><strong>Order Number:</strong> ${order.orderNumber}</p>
            <p><strong>Refund Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
            <p><strong>Refund Date:</strong> ${new Date(order.refundedAt).toLocaleDateString()}</p>
            ${order.refundReason ? `<p><strong>Reason:</strong> ${order.refundReason}</p>` : ""}
          </div>
          
          <p>The refund will appear in your original payment method within 5-10 business days.</p>
          
          <p>If you have any questions about this refund, please don't hesitate to contact our customer support.</p>
          
          <p>Best regards,<br>The Bookstore Team</p>
        </div>
      </body>
      </html>
    `;
  }
}
