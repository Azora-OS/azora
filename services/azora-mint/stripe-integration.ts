import Stripe from 'stripe'
import { prisma } from '../../infrastructure/database/prisma-config'
import { logger } from '../../infrastructure/monitoring/logger'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export class StripePaymentProcessor {
  // Create payment intent
  async createPaymentIntent(amount: number, currency: string, userId: string) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: { userId }
      })

      // Store in database
      await prisma.transaction.create({
        data: {
          type: 'PAYMENT',
          status: 'PENDING',
          amount,
          coinType: currency as any,
          usdEquivalent: amount,
          hash: paymentIntent.id,
          externalTxnId: paymentIntent.id,
          senderId: userId
        }
      })

      return {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      }
    } catch (error) {
      logger.error('Payment intent creation failed', { error, userId, amount })
      throw error
    }
  }

  // Handle webhook events
  async handleWebhook(body: string, signature: string) {
    try {
      const event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      )

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent)
          break
        case 'payment_intent.payment_failed':
          await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent)
          break
      }

      return { received: true }
    } catch (error) {
      logger.error('Webhook handling failed', { error })
      throw error
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
    await prisma.transaction.updateMany({
      where: { externalTxnId: paymentIntent.id },
      data: { status: 'COMPLETED' }
    })

    // Update user wallet
    const userId = paymentIntent.metadata.userId
    if (userId) {
      await prisma.wallet.update({
        where: { userId },
        data: {
          balance: {
            increment: paymentIntent.amount / 100
          }
        }
      })
    }
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
    await prisma.transaction.updateMany({
      where: { externalTxnId: paymentIntent.id },
      data: { status: 'FAILED' }
    })
  }
}