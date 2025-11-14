/**
 * PayPal Configuration
 */

module.exports = {
  clientId: process.env.PAYPAL_CLIENT_ID || 'mock_client_id',
  clientSecret: process.env.PAYPAL_CLIENT_SECRET || 'mock_secret',
  mode: process.env.PAYPAL_MODE || 'sandbox', // sandbox or live
  currency: 'USD',
  returnUrl: process.env.PAYPAL_RETURN_URL || 'http://localhost:3000/payment/success',
  cancelUrl: process.env.PAYPAL_CANCEL_URL || 'http://localhost:3000/payment/cancel'
};
