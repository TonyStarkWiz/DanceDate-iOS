// API endpoint for confirming Stripe Payment Intents
// This completes the payment and saves the payment method

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
    const { paymentIntentId, paymentMethodData } = req.body;

    console.log('🧪 Confirming Payment Intent:', paymentIntentId);

    if (!paymentIntentId) {
      return res.status(400).json({ error: 'Payment Intent ID is required' });
    }

    // Retrieve the Payment Intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (!paymentIntent) {
      return res.status(404).json({ error: 'Payment Intent not found' });
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
        payment_intent_id: paymentIntentId,
        created_at: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    });

    console.log('🧪 Payment Method created:', paymentMethod.id);

    // Attach the Payment Method to the Payment Intent
    const confirmedPaymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethod.id,
    });

    console.log('🧪 Payment Intent confirmed:', confirmedPaymentIntent.id);

    // Return the payment method details
    res.status(200).json({
      success: true,
      paymentIntent: {
        id: confirmedPaymentIntent.id,
        status: confirmedPaymentIntent.status,
        amount: confirmedPaymentIntent.amount,
        currency: confirmedPaymentIntent.currency
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
    console.error('🧪 Error confirming Payment Intent:', error);
    
    res.status(500).json({ 
      error: 'Failed to confirm Payment Intent',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

