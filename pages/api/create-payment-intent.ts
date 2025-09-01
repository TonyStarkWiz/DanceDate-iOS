// API endpoint for creating Stripe Payment Intents
// Uses setup_future_usage to save payment methods for future use

import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency = 'usd', setupFutureUsage = 'off_session', metadata = {} } = req.body;

    console.log('🧪 Creating Payment Intent for amount:', amount, 'with setup_future_usage:', setupFutureUsage);

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount, // Amount in cents
      currency,
      setup_future_usage: setupFutureUsage as 'on_session' | 'off_session',
      payment_method_types: ['card'],
      metadata: {
        ...metadata,
        created_at: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      },
      // For subscriptions, we typically want off_session usage
      // This allows charging the card later without customer present
    });

    console.log('🧪 Payment Intent created:', paymentIntent.id);

    res.status(200).json({
      id: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      clientSecret: paymentIntent.client_secret,
      setupFutureUsage: paymentIntent.setup_future_usage,
      metadata: paymentIntent.metadata
    });

  } catch (error) {
    console.error('🧪 Error creating Payment Intent:', error);
    
    res.status(500).json({ 
      error: 'Failed to create Payment Intent',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

