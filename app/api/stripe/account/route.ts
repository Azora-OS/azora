import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(request: NextRequest) {
  try {
    let account = null;
    let balance = null;
    let charges = [];
    let paymentIntents = [];
    let customers = [];

    // Try to fetch account information (may not work in test mode)
    try {
      account = await stripe.accounts.retrieve();
    } catch (error) {
      console.log('Account retrieval failed (expected in test mode):', error);
      account = { id: 'Test Account', country: 'US', default_currency: 'usd' };
    }

    // Fetch balance
    try {
      balance = await stripe.balance.retrieve();
    } catch (error) {
      console.log('Balance retrieval failed:', error);
      balance = { available: [{ amount: 0, currency: 'usd' }], pending: [] };
    }

    // Fetch recent charges (last 10)
    try {
      const chargesResponse = await stripe.charges.list({ limit: 10 });
      charges = chargesResponse.data;
    } catch (error) {
      console.log('Charges retrieval failed:', error);
    }

    // Fetch payment intents (last 10)
    try {
      const paymentIntentsResponse = await stripe.paymentIntents.list({ limit: 10 });
      paymentIntents = paymentIntentsResponse.data;
    } catch (error) {
      console.log('Payment intents retrieval failed:', error);
    }

    // Fetch customers (last 10)
    try {
      const customersResponse = await stripe.customers.list({ limit: 10 });
      customers = customersResponse.data;
    } catch (error) {
      console.log('Customers retrieval failed:', error);
    }

    // Fetch API keys info (this might not be directly available, but we can show configured keys)
    const apiKeys = {
      secret_key: process.env.STRIPE_SECRET_KEY ? 'Configured (Test Key)' : 'Not configured',
      publishable_key: process.env.STRIPE_PUBLISHABLE_KEY ? 'Configured (Test Key)' : 'Not configured',
      restricted_key: process.env.STRIPE_RESTRICTED_API_KEY ? 'Configured' : 'Not configured',
      payments_profile_id: process.env.STRIPE_PAYMENTS_PROFILE_ID || 'Not configured',
      webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || 'Not configured',
    };

    return NextResponse.json({
      account,
      balance,
      charges,
      paymentIntents,
      customers,
      apiKeys,
      profile: {
        id: process.env.STRIPE_PAYMENTS_PROFILE_ID,
        email: 'sizwe.ngwenya@azora.world',
      },
    });
  } catch (error) {
    console.error('Stripe API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch Stripe data' },
      { status: 500 }
    );
  }
}

