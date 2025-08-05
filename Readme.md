# 📚 Bookstore GraphQL API

A complete bookstore management system built with NestJS, GraphQL, TypeORM, Stripe, and Docker.

## 🌟 Features

### 🔐 Authentication & Authorization

- JWT-based authentication with refresh tokens
- Strong password validation
- Email uniqueness validation
- Protected routes with ownership checks

### 🏪 Store Management

- CRUD operations for bookstores
- User ownership validation
- Public store listings
- Store-specific book management

### 📖 Book Management

- Complete book catalog with metadata
- Stock management
- Price management
- Search functionality
- Book categorization by store

### 🛒 Shopping Cart

- Single active cart per user
- Real-time stock validation
- Automatic total calculation
- Cart persistence
- Pre-checkout validation

### 📦 Order Management

- Stripe payment integration
- Order tracking with unique numbers
- Refund system with reason tracking
- Email notifications
- Order history and statistics

### 📧 Email Notifications

- Order confirmation emails
- Refund confirmation emails
- HTML templates with order details

### 💳 Payment Processing

- Stripe PaymentIntent integration
- Secure webhook handling
- Refund processing
- Payment status tracking

## 🛠️ Tech Stack

- **Backend**: NestJS (Node.js + TypeScript)
- **API**: GraphQL with Apollo Server
- **Database**: PostgreSQL with TypeORM
- **Payments**: Stripe API
- **Email**: Nodemailer
- **Authentication**: JWT + Passport
- **Containerization**: Docker & Docker Compose
- **Validation**: class-validator

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Stripe account (for payments)

### 1. Clone and Setup

```bash
git clone <repository-url>
cd fullname_bookstore

# Copy environment variables
cp .env.example .env
```

### 2. Configure Environment

Edit `.env` with your settings:

```bash
# Database (default values work with Docker)
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USERNAME=bookstore_user
DATABASE_PASSWORD=bookstore_password
DATABASE_NAME=bookstore_db

JWT_SECRET=3b79b5f1cba54992a8351f6a9291f9d3c3e8948a012edcc35f84f94b83db137d
JWT_REFRESH_SECRET=d9d1a1fc9d54406ba5fc55a39a0bbacdb9f5a7c19df5ef6947d26a0bdfb54678
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
MAIL_FROM=noreply@bookstore.com

NODE_ENV=development
PORT=3008
```

### 3. Start the Application

```bash
# Using Makefile (recommended)
make up

# Or using Docker Compose directly
docker-compose up -d
```

### 4. Access the API

- **GraphQL Playground**: http://localhost:3008/graphql
- **API Endpoint**: http://localhost:3008/graphql

## 📊 Sample Data

The application automatically creates sample data on first run:

### Test Users

- **Email**: `john.doe@bookstore.com`
- **Email**: `jane.smith@bookstore.com`
- **Password**: `Test123!@#`

### Postman collection

https://aflalo-yoel-5573750.postman.co/workspace/Yoel-Aflalo's-Workspace~be7ce223-8f2c-4335-8ac6-1e9437b6c5f4/collection/688bc90fc868dbe19260eb2f?action=share&creator=47237531

## 🎯 API Usage

### Authentication

```graphql
# Sign up
mutation {
  signUp(input: { email: "user@example.com", password: "Test123!@#" }) {
    accessToken
    refreshToken
    user {
      id
      email
    }
  }
}

# Login
mutation {
  login(input: { email: "john.doe@bookstore.com", password: "Test123!@#" }) {
    accessToken
    user {
      id
      email
    }
  }
}
```

### Shopping Flow

```graphql
# Add to cart
mutation {
  addToCart(input: { bookId: "book-uuid", quantity: 2 }) {
    id
    totalAmount
    items {
      quantity
      book {
        title
        price
      }
    }
  }
}

# Create payment intent
mutation {
  createPaymentIntent(input: { notes: "My order" }) {
    clientSecret
    orderId
  }
}

# Confirm payment (after Stripe payment)
mutation {
  confirmPayment(orderId: "order-uuid") {
    id
    orderNumber
    status
    totalAmount
  }
}
```

## 🔧 Development

### Available Commands

```bash
# Start development
make up

# View logs
make logs

# Restart services
make restart

# Clean everything
make clean

# Database shell
make db-shell

# Manual data initialization
make init-data
```

### Project Structure

```
src/
├── auth/           # Authentication & JWT
├── users/          # User management
├── stores/         # Store management
├── books/          # Book catalog
├── carts/          # Shopping cart
├── orders/         # Order processing
├── common/         # Shared utilities
└── main.ts         # Application entry point
```

### Database Schema

- **Users**: Authentication and user data
- **Stores**: Bookstore information
- **Books**: Product catalog
- **Carts/CartItems**: Shopping cart
- **Orders/OrderItems**: Order history

## 💳 Stripe Integration

### Payment Flow

1. User adds items to cart
2. Cart validation before checkout
3. Create Stripe PaymentIntent
4. Frontend handles Stripe payment
5. Confirm payment in backend
6. Update stock and send email

### Webhooks

- Endpoint: `POST /api/v1/webhooks/stripe`
- Handles payment confirmations
- Provides additional security

## 📧 Email Templates

Beautiful HTML email templates for:

- Order confirmations with itemized details
- Refund notifications
- Responsive design

## 🧪 Testing

### Manual Testing

1. Use GraphQL Playground
2. Test with sample users
3. Complete order workflow
4. Test refund process

### API Testing

- Import Postman collection (generate from GraphQL schema)
- Use curl commands
- GraphQL introspection

## 🚦 Production Deployment

### Security Checklist

- [ ] Change JWT secrets
- [ ] Use production Stripe keys
- [ ] Configure proper CORS
- [ ] Set up SSL/TLS
- [ ] Configure email provider
- [ ] Set up proper logging
- [ ] Configure database backups

### Environment Variables

```bash
NODE_ENV=production
DATABASE_SSL=true
# ... other production settings
```

## 📝 API Documentation

The GraphQL schema is self-documenting. Access the GraphQL Playground to explore:

- All available queries and mutations
- Input/output types
- Field descriptions
- Real-time schema introspection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is for educational/interview purposes.

## 📞 Support

For questions or issues:

1. Check the GraphQL Playground for API documentation
2. Review the application logs: `make logs`
