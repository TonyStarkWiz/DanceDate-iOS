import * as cors from 'cors';
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions';
import Stripe from 'stripe';

// Authentication middleware
const requireAuth = async (req: any, res: any, next: any) => {
  try {
    const header = req.headers.authorization || '';
    const match = header.match(/^Bearer (.+)$/);
    if (!match) {
      return res.status(401).json({ error: 'Missing authorization token' });
    }

    const decoded = await admin.auth().verifyIdToken(match[1]);
    req.user = decoded; // contains uid, email, etc.
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid authorization token' });
  }
};

// Initialize Firebase Admin with service account from environment
const serviceAccountBase64 = process.env.SERVICE_ACCOUNT_BASE64;
if (!serviceAccountBase64) {
  throw new Error('SERVICE_ACCOUNT_BASE64 environment variable is required');
}

const serviceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'dancelinkbackend'
});

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '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', {
  apiVersion: '2023-10-16',
});

// Enable CORS
const corsHandler = cors({ origin: true });

// Product configuration matching your frontend
const PRODUCTS = {
  premiumMonthly: {
    id: 'prod_SxkRN2JNoOElpt',
    priceId: 'price_1S1owyBbx323AwXG6K38Xemb',
    name: 'Premium Monthly',
    price: 1499, // $14.99 in cents
    currency: 'usd',
    interval: 'month'
  },
  premiumAnnual: {
    id: 'prod_SxkTsDKCBTkAEr',
    priceId: 'price_1S1oyZBbx323AwXGlCne4izj',
    name: 'Premium Annual',
    price: 14999, // $149.99 in cents
    currency: 'usd',
    interval: 'year'
  }
};

// Create payment intent for Apple Pay
export const createPaymentIntent = functions.https.onRequest((request, response) => {
  return corsHandler(request, response, async () => {
    // Apply auth middleware
    await requireAuth(request, response, async () => {
      try {
        const { productId } = request.body;
        const customerId = request.user.uid; // Get from authenticated user

              if (!productId) {
          response.status(400).json({ error: 'Missing productId' });
          return;
        }

      const product = PRODUCTS[productId as keyof typeof PRODUCTS];
      if (!product) {
        response.status(400).json({ error: 'Invalid product ID' });
        return;
      }

              // Create or get Stripe customer
        let stripeCustomer;
        try {
          const customers = await stripe.customers.list({ email: request.user.email });
          if (customers.data.length > 0) {
            stripeCustomer = customers.data[0];
          } else {
            stripeCustomer = await stripe.customers.create({
              email: request.user.email,
              metadata: {
                firebase_uid: customerId
              }
            });
          }
        } catch (error) {
          console.error('Error creating/getting customer:', error);
          response.status(500).json({ error: 'Failed to create customer' });
          return;
        }

      // Create payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: product.price,
        currency: product.currency,
        customer: stripeCustomer.id,
        metadata: {
          productId: product.id,
          priceId: product.priceId,
          firebase_uid: customerId
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      response.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });

    } catch (error) {
      console.error('Error creating payment intent:', error);
      response.status(500).json({ error: 'Failed to create payment intent' });
    }
    });
  });
});

// Process Apple Pay payment
export const processApplePayPayment = functions.https.onRequest((request, response) => {
  return corsHandler(request, response, async () => {
    // Apply auth middleware
    await requireAuth(request, response, async () => {
      try {
        const { paymentIntentId, productId } = request.body;
        const customerId = request.user.uid; // Get from authenticated user

              if (!paymentIntentId || !productId) {
          response.status(400).json({ error: 'Missing required parameters' });
          return;
        }

      const product = PRODUCTS[productId as keyof typeof PRODUCTS];
      if (!product) {
        response.status(400).json({ error: 'Invalid product ID' });
        return;
      }

      // Confirm the payment intent
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

      if (paymentIntent.status === 'succeeded') {
        // Update user's premium status in Firestore
        const db = admin.firestore();
        const userRef = db.collection('users').doc(customerId);
        
        await userRef.update({
          premiumUser: {
            isPremium: true,
            subscriptionTier: 'PREMIUM',
            subscriptionStartDate: admin.firestore.FieldValue.serverTimestamp(),
            subscriptionEndDate: product.interval === 'month' 
              ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
              : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
            productId: product.id,
            priceId: product.priceId
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        response.json({
          success: true,
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency
        });
      } else {
        response.status(400).json({ 
          error: 'Payment failed',
          status: paymentIntent.status 
        });
      }

    } catch (error) {
      console.error('Error processing Apple Pay payment:', error);
      response.status(500).json({ error: 'Failed to process payment' });
    }
    });
  });
});

// Create subscription (for recurring payments)
export const createSubscription = functions.https.onRequest((request, response) => {
  return corsHandler(request, response, async () => {
    // Apply auth middleware
    await requireAuth(request, response, async () => {
      try {
        const { productId, paymentMethodId } = request.body;
        const customerId = request.user.uid; // Get from authenticated user

              if (!productId || !paymentMethodId) {
          response.status(400).json({ error: 'Missing required parameters' });
          return;
        }

      const product = PRODUCTS[productId as keyof typeof PRODUCTS];
      if (!product) {
        response.status(400).json({ error: 'Invalid product ID' });
        return;
      }

              // Get or create Stripe customer
        let stripeCustomer;
        try {
          const customers = await stripe.customers.list({ email: request.user.email });
          if (customers.data.length > 0) {
            stripeCustomer = customers.data[0];
          } else {
            stripeCustomer = await stripe.customers.create({
              email: request.user.email,
              metadata: {
                firebase_uid: customerId
              }
            });
          }
        } catch (error) {
          console.error('Error creating/getting customer:', error);
          response.status(500).json({ error: 'Failed to create customer' });
          return;
        }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: stripeCustomer.id,
      });

      // Set as default payment method
      await stripe.customers.update(stripeCustomer.id, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomer.id,
        items: [{ price: product.priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
        metadata: {
          firebase_uid: customerId,
          productId: product.id
        }
      });

      response.json({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any).payment_intent.client_secret
      });

    } catch (error) {
      console.error('Error creating subscription:', error);
      response.status(500).json({ error: 'Failed to create subscription' });
    }
    });
  });
});

// Webhook to handle Stripe events
export const stripeWebhook = functions.https.onRequest(async (request, response) => {
  const sig = request.headers['stripe-signature'];
  const endpointSecret = functions.config().stripe.webhook_secret;

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.rawBody, sig!, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err);
    response.status(400).send(`Webhook Error: ${err.message || 'Unknown error'}`);
    return;
  }

  const db = admin.firestore();

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful:', paymentIntent.id);
      
      // Update user's premium status
      if (paymentIntent.metadata?.firebase_uid) {
        const userRef = db.collection('users').doc(paymentIntent.metadata.firebase_uid);
        await userRef.update({
          premiumUser: {
            isPremium: true,
            subscriptionTier: 'PREMIUM',
            subscriptionStartDate: admin.firestore.FieldValue.serverTimestamp(),
            lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
            productId: paymentIntent.metadata.productId,
            priceId: paymentIntent.metadata.priceId
          },
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log('Invoice payment succeeded:', invoice.id);
      
      // Handle recurring payment success
      if (invoice.customer && invoice.subscription) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        if (subscription.metadata?.firebase_uid) {
          const userRef = db.collection('users').doc(subscription.metadata.firebase_uid);
          await userRef.update({
            'premiumUser.lastPaymentDate': admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
      break;

    case 'customer.subscription.deleted':
      const subscription = event.data.object;
      console.log('Subscription was deleted:', subscription.id);
      
      // Handle subscription cancellation
      if (subscription.metadata?.firebase_uid) {
        const userRef = db.collection('users').doc(subscription.metadata.firebase_uid);
        await userRef.update({
          'premiumUser.isPremium': false,
          'premiumUser.subscriptionTier': 'FREE',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  response.json({ received: true });
});

// Get user's premium status
export const getPremiumStatus = functions.https.onRequest((request, response) => {
  return corsHandler(request, response, async () => {
    // Apply auth middleware
    await requireAuth(request, response, async () => {
      try {
        const customerId = request.user.uid; // Get from authenticated user

        const db = admin.firestore();
        const userDoc = await db.collection('users').doc(customerId as string).get();

        if (!userDoc.exists) {
          response.status(404).json({ error: 'User not found' });
          return;
        }

        const userData = userDoc.data();
        response.json({
          isPremium: userData?.premiumUser?.isPremium || false,
          subscriptionTier: userData?.premiumUser?.subscriptionTier || 'FREE',
          subscriptionStartDate: userData?.premiumUser?.subscriptionStartDate,
          subscriptionEndDate: userData?.premiumUser?.subscriptionEndDate,
          lastPaymentDate: userData?.premiumUser?.lastPaymentDate
        });

      } catch (error) {
        console.error('Error getting premium status:', error);
        response.status(500).json({ error: 'Failed to get premium status' });
      }
    });
  });
});
