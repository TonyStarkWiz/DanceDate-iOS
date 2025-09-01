// API endpoint for creating Stripe subscriptions
// Uses saved payment methods from Setup Intents

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
    const { priceId, paymentMethodId, metadata = {} } = req.body;

    console.log('🧪 Creating subscription with price:', priceId);

    if (!priceId || !paymentMethodId) {
      return res.status(400).json({ 
        error: 'Price ID and Payment Method ID are required' 
      });
    }

    // Create or retrieve customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: metadata.email || 'customer@example.com',
      limit: 1
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log('🧪 Using existing customer:', customer.id);
    } else {
      customer = await stripe.customers.create({
        email: metadata.email || 'customer@example.com',
        name: metadata.name || 'Customer',
        metadata: {
          ...metadata,
          created_at: new Date().toISOString(),
          environment: process.env.NODE_ENV || 'development'
        }
      });
      console.log('🧪 Created new customer:', customer.id);
    }

    // Attach payment method to customer if not already attached
    try {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      });
      console.log('🧪 Payment method attached to customer');
    } catch (attachError) {
      // Payment method might already be attached
      console.log('🧪 Payment method already attached or error:', attachError);
    }

    // Set as default payment method
    await stripe.customers.update(customer.id, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      metadata: {
        ...metadata,
        customer_id: customer.id,
        payment_method_id: paymentMethodId,
        created_at: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
      }
    });

    console.log('🧪 Subscription created:', subscription.id);

    res.status(200).json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodStart: subscription.current_period_start,
        currentPeriodEnd: subscription.current_period_end,
        customerId: customer.id,
        priceId: priceId
      },
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name
      },
      paymentMethod: {
        id: paymentMethodId
      }
    });

  } catch (error) {
    console.error('🧪 Error creating subscription:', error);
    
    res.status(500).json({ 
      error: 'Failed to create subscription',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

