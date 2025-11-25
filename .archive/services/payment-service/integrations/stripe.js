const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const createPaymentIntent = async (amount, currency = 'usd', userId, metadata = {}) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      metadata: {
        userId,
        ...metadata
      },
      automatic_payment_methods: {
        enabled: true
      }
    });
    
    console.log(`✅ Payment intent created: ${paymentIntent.id}`);
    return paymentIntent;
  } catch (error) {
    console.error('Stripe payment intent error:', error);
    throw error;
  }
};

const handleWebhook = async (event) => {
  console.log(`📥 Webhook received: ${event.type}`);
  
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log(`✅ Payment succeeded: ${paymentIntent.id}`);
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log(`❌ Payment failed: ${failedPayment.id}`);
      break;
      
    case 'charge.succeeded':
      const charge = event.data.object;
      console.log(`✅ Charge succeeded: ${charge.id}`);
      break;
      
    default:
      console.log(`ℹ️ Unhandled event type: ${event.type}`);
  }
};

const createCustomer = async (email, name, metadata = {}) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata
    });
    
    console.log(`✅ Customer created: ${customer.id}`);
    return customer;
  } catch (error) {
    console.error('Stripe customer creation error:', error);
    throw error;
  }
};

const createSubscription = async (customerId, priceId) => {
  try {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent']
    });
    
    console.log(`✅ Subscription created: ${subscription.id}`);
    return subscription;
  } catch (error) {
    console.error('Stripe subscription error:', error);
    throw error;
  }
};

module.exports = {
  createPaymentIntent,
  handleWebhook,
  createCustomer,
  createSubscription
};
