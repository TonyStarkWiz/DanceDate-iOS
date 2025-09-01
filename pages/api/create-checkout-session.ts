// Stripe Checkout Session API - Premium Upgrade
// Handles Stripe payment processing for premium upgrades

import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe('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', {
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
    const { priceId, userId, planId, successUrl, cancelUrl } = req.body;

    // Validate required fields
    if (!priceId || !userId || !planId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${req.headers.origin}/premium-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${req.headers.origin}/premium-cancel`,
      client_reference_id: userId,
      metadata: {
        userId,
        planId,
        upgradeType: 'premium',
      },
      subscription_data: {
        metadata: {
          userId,
          planId,
          upgradeType: 'premium',
        },
      },
      customer_email: req.body.customerEmail, // Optional: if you have user email
      allow_promotion_codes: true,
      billing_address_collection: 'required',
      payment_method_collection: 'always',
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}


