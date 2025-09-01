// API endpoint for creating Stripe Setup Intents
// This saves payment methods without charging immediately

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
    const { usage = 'off_session', metadata = {} } = req.body;

    console.log('🧪 Creating Setup Intent with usage:', usage);

    // Create Setup Intent
    const setupIntent = await stripe.setupIntents.create({
      usage: usage as 'on_session' | 'off_session',
      payment_method_types: ['card'],
      metadata: {
        ...metadata,
        created_at: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      },
      // For subscriptions, we typically want off_session usage
      // This allows charging the card later without customer present
    });

    console.log('🧪 Setup Intent created:', setupIntent.id);

    res.status(200).json({
      id: setupIntent.id,
      clientSecret: setupIntent.client_secret,
      status: setupIntent.status,
      paymentMethodTypes: setupIntent.payment_method_types,
      usage: setupIntent.usage,
      metadata: setupIntent.metadata
    });

  } catch (error) {
    console.error('🧪 Error creating Setup Intent:', error);
    
    res.status(500).json({ 
      error: 'Failed to create Setup Intent',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

