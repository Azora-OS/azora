# Billing Service

A comprehensive billing and payment processing service for the Azora ecosystem.

## Features

- **Invoice Management**: Create, track, and manage invoices
- **Payment Processing**: Process payments through various methods
- **Customer Management**: Maintain customer information and billing history
- **Status Tracking**: Monitor the status of invoices and payments
- **RESTful API**: Well-documented API endpoints for all billing functions

## API Endpoints

### Health & Info
- `GET /health` - Service health check

### Invoices
- `GET /api/invoices` - Get all invoices
- `GET /api/invoices/:invoiceId` - Get specific invoice
- `POST /api/invoices` - Create a new invoice
- `PUT /api/invoices/:invoiceId` - Update invoice status

### Payments
- `GET /api/payments` - Get all payments
- `GET /api/payments/:paymentId` - Get specific payment
- `POST /api/payments` - Process a payment

### Customers
- `GET /api/customers` - Get all customers
- `GET /api/customers/:customerId` - Get specific customer
- `POST /api/customers` - Create a new customer
- `GET /api/customers/:customerId/invoices` - Get invoices for a customer
- `GET /api/customers/:customerId/payments` - Get payment history for a customer

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the service:
   ```bash
   npm start
   ```

3. For development:
   ```bash
   npm run dev
   ```

## Environment Variables

Create a `.env` file with the following variables:

```
PORT=3029
LOG_LEVEL=info
```

## Invoice Status Types

The service supports the following invoice status types:

1. **Pending**: Invoice has been created but not yet paid
2. **Paid**: Invoice has been fully paid
3. **Overdue**: Invoice payment is past the due date
4. **Cancelled**: Invoice has been cancelled

## Payment Methods

The service supports various payment methods:

1. **Credit Card**: Payment via credit or debit card
2. **Bank Transfer**: Direct bank transfer
3. **Cryptocurrency**: Payment in digital currencies
4. **PayPal**: Payment through PayPal platform

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

PROPRIETARY