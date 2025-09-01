// API endpoint for confirming Stripe Setup Intents
// This saves the payment method to the customer

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
    const { setupIntentId, paymentMethodData } = req.body;

    console.log('🧪 Confirming Setup Intent:', setupIntentId);

    if (!setupIntentId) {
      return res.status(400).json({ error: 'Setup Intent ID is required' });
    }

    // Retrieve the Setup Intent
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
    
    if (!setupIntent) {
      return res.status(404).json({ error: 'Setup Intent not found' });
    }

    // Create a Payment Method
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: paymentMethodData.card.token || undefined,
        number: paymentMethodData.card.number,
        exp_month: paymentMethodData.card.expMonth,
        exp_year: paymentMethodData.card.expYear,
        cvc: paymentMethodData.card.cvc,
      },
      billing_details: {
        name: paymentMethodData.billingDetails?.name,
        email: paymentMethodData.billingDetails?.email,
      },
      metadata: {
        setup_intent_id: setupIntentId,
        created_at: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    });

    console.log('🧪 Payment Method created:', paymentMethod.id);

    // Attach the Payment Method to the Setup Intent
    const confirmedSetupIntent = await stripe.setupIntents.confirm(setupIntentId, {
      payment_method: paymentMethod.id,
    });

    console.log('🧪 Setup Intent confirmed:', confirmedSetupIntent.id);

    // Return the payment method details
    res.status(200).json({
      success: true,
      setupIntent: {
        id: confirmedSetupIntent.id,
        status: confirmedSetupIntent.status,
        usage: confirmedSetupIntent.usage
      },
      paymentMethod: {
        id: paymentMethod.id,
        type: paymentMethod.type,
        card: paymentMethod.card ? {
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          expMonth: paymentMethod.card.exp_month,
          expYear: paymentMethod.card.exp_year
        } : undefined,
        billingDetails: {
          name: paymentMethod.billing_details?.name,
          email: paymentMethod.billing_details?.email
        }
      }
    });

  } catch (error) {
    console.error('🧪 Error confirming Setup Intent:', error);
    
    res.status(500).json({ 
      error: 'Failed to confirm Setup Intent',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

