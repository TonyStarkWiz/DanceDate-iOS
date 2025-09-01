import { loadStripe, Stripe } from '@stripe/stripe-js';

// Real Stripe Integration Service
// Uses Payment Intents API with setup_future_usage for subscriptions

export interface StripeConfig {
  publishableKey: string;
  secretKey: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  billingDetails?: {
    name?: string;
    email?: string;
  };
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
  setupFutureUsage?: 'on_session' | 'off_session';
}

export interface CardData {
  number: string;
  expMonth: number;
  expYear: number;
  cvc: string;
}

export class StripeService {
  private static instance: StripeService;
  private config: StripeConfig;
  private stripe: Stripe | null = null;

  private constructor() {
    // Initialize with your Stripe keys
    this.config = {
      publishableKey: 'pk_live_51JCtz2Bbx323AwXGWDDut14CSM99IXmENeK81VtFD4hCKLMxm0coOZGnApzjLSfKe7EKtR1vAdYdHVjc571f9LQA00JUFDIeKD',
      secretKey: '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'
    };
    
    this.initializeStripe();
  }

  private async initializeStripe() {
    try {
      this.stripe = await loadStripe(this.config.publishableKey);
      console.log('🧪 Stripe.js initialized successfully');
    } catch (error) {
      console.error('🧪 Error initializing Stripe.js:', error);
    }
  }

  public static getInstance(): StripeService {
    if (!StripeService.instance) {
      StripeService.instance = new StripeService();
    }
    return StripeService.instance;
  }

  // Create a Payment Intent for immediate payment + future usage
  async createPaymentIntent(amount: number, currency: string = 'usd', setupFutureUsage: 'on_session' | 'off_session' = 'off_session'): Promise<PaymentIntent> {
    try {
      console.log('🧪 Creating Payment Intent for amount:', amount, 'with setup_future_usage:', setupFutureUsage);
      
      // Call Stripe API directly since we're not using Next.js
      const response = await fetch('https://api.stripe.com/v1/payment_intents', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          amount: amount.toString(),
          currency,
          setup_future_usage: setupFutureUsage,
          'payment_method_types[]': 'card',
          'metadata[userId]': 'current_user_id',
          'metadata[purpose]': 'subscription_payment',
          'metadata[created_at]': new Date().toISOString()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      const paymentIntent = await response.json();
      console.log('🧪 Real Payment Intent created:', paymentIntent.id);
      
      return {
        id: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
        clientSecret: paymentIntent.client_secret,
        setupFutureUsage: paymentIntent.setup_future_usage
      };
    } catch (error) {
      console.error('🧪 Error creating Payment Intent:', error);
      throw error;
    }
  }

  // Create a simulated Payment Intent for development/testing
  private createSimulatedPaymentIntent(amount: number, currency: string, setupFutureUsage: 'on_session' | 'off_session'): PaymentIntent {
    console.log('🧪 Creating simulated Payment Intent');
    
    return {
      id: 'pi_' + Math.random().toString(36).substr(2, 9),
      amount,
      currency,
      status: 'requires_payment_method',
      clientSecret: 'pi_' + Math.random().toString(36).substr(2, 9) + '_secret_' + Math.random().toString(36).substr(2, 9),
      setupFutureUsage
    };
  }

  // Create a Payment Method using Stripe.js (secure way)
  async createPaymentMethod(cardData: CardData, billingDetails?: { name?: string; email?: string }): Promise<PaymentMethod> {
    try {
      console.log('🧪 Creating Payment Method using Stripe.js');
      
      if (!this.stripe) {
        throw new Error('Stripe.js not initialized');
      }

      // Use Stripe.js to create a Payment Method (this tokenizes the card data)
      const { paymentMethod, error } = await this.stripe.createPaymentMethod({
        type: 'card',
        card: {
          number: cardData.number,
          exp_month: cardData.expMonth,
          exp_year: cardData.expYear,
          cvc: cardData.cvc,
        },
        billing_details: billingDetails
      });

      if (error) {
        console.error('🧪 Stripe.js error creating Payment Method:', error);
        throw new Error(error.message);
      }

      if (!paymentMethod) {
        throw new Error('Failed to create Payment Method');
      }

      console.log('🧪 Payment Method created via Stripe.js:', paymentMethod.id);
      
      return {
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
      };
    } catch (error) {
      console.error('🧪 Error creating Payment Method:', error);
      throw error;
    }
  }

  // Confirm the Payment Intent with payment method details
  async confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string): Promise<PaymentMethod> {
    try {
      console.log('🧪 Confirming Payment Intent:', paymentIntentId, 'with Payment Method:', paymentMethodId);
      
      // Confirm the Payment Intent with the Payment Method ID (not raw card data)
      const confirmResponse = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}/confirm`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          payment_method: paymentMethodId
        })
      });

      if (!confirmResponse.ok) {
        const errorData = await confirmResponse.json();
        throw new Error(errorData.error?.message || `Payment Intent confirmation failed: ${confirmResponse.status}`);
      }

      const confirmedPaymentIntent = await confirmResponse.json();
      console.log('🧪 Real Payment Intent confirmed:', confirmedPaymentIntent.id);
      
      // Return the Payment Method details
      return {
        id: paymentMethodId,
        type: 'card',
        card: {
          brand: 'visa', // We'll get this from the Payment Method creation
          last4: '****', // We'll get this from the Payment Method creation
          expMonth: 12,
          expYear: 2025
        },
        billingDetails: {
          name: '',
          email: ''
        }
      };
    } catch (error) {
      console.error('🧪 Error confirming Payment Intent:', error);
      
      // Enhanced error handling for different scenarios
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        // Handle specific Stripe error types
        if (errorMessage.includes('card_declined')) {
          throw new Error('card_declined: Your card was declined. Please try a different card.');
        } else if (errorMessage.includes('insufficient_funds')) {
          throw new Error('insufficient_funds: Insufficient funds. Please try a different card.');
        } else if (errorMessage.includes('expired_card')) {
          throw new Error('expired_card: Your card has expired. Please use a different card.');
        } else if (errorMessage.includes('incorrect_cvc')) {
          throw new Error('incorrect_cvc: Invalid CVC code. Please check your card details.');
        } else if (errorMessage.includes('invalid_number')) {
          throw new Error('invalid_number: Invalid card number. Please check your card details.');
        } else if (errorMessage.includes('processing_error')) {
          throw new Error('processing_error: A processing error occurred. Please try again.');
        }
      }
      
      // Re-throw the error for proper error handling
      throw error;
    }
  }

  // Complete payment flow using Stripe.js
  async processPayment(amount: number, cardData: CardData, billingDetails?: { name?: string; email?: string }): Promise<{ success: boolean; paymentMethod?: PaymentMethod; error?: string }> {
    try {
      console.log('🧪 Processing payment with Stripe.js flow');
      
      // Step 1: Create Payment Intent
      const paymentIntent = await this.createPaymentIntent(amount);
      
      // Step 2: Create Payment Method using Stripe.js (secure)
      const paymentMethod = await this.createPaymentMethod(cardData, billingDetails);
      
      // Step 3: Confirm Payment Intent with Payment Method
      const confirmedPaymentMethod = await this.confirmPaymentIntent(paymentIntent.id, paymentMethod.id);
      
      console.log('🧪 Payment processed successfully');
      
      return {
        success: true,
        paymentMethod: confirmedPaymentMethod
      };
    } catch (error) {
      console.error('🧪 Payment processing failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  // Create a simulated Payment Method for development/testing
  private createSimulatedPaymentMethod(paymentMethodData: any): PaymentMethod {
    console.log('🧪 Creating simulated Payment Method');
    
    return {
      id: 'pm_' + Math.random().toString(36).substr(2, 9),
      type: 'card',
      card: {
        brand: 'visa',
        last4: paymentMethodData.card?.number?.slice(-4) || '4242',
        expMonth: parseInt(paymentMethodData.card?.expMonth) || 12,
        expYear: parseInt(paymentMethodData.card?.expYear) || 2025
      },
      billingDetails: {
        name: paymentMethodData.billingDetails?.name || 'Test User',
        email: paymentMethodData.billingDetails?.email || 'test@example.com'
      }
    };
  }

  // Get payment intent status
  async getPaymentIntentStatus(paymentIntentId: string): Promise<string> {
    try {
      const response = await fetch(`/api/payment-intent-status/${paymentIntentId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.status;
    } catch (error) {
      console.error('🧪 Error getting payment intent status:', error);
      return 'unknown';
    }
  }

  // Get customer's saved payment methods
  async getPaymentMethods(customerId: string): Promise<PaymentMethod[]> {
    try {
      const response = await fetch(`/api/payment-methods/${customerId}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.paymentMethods;
    } catch (error) {
      console.error('🧪 Error getting payment methods:', error);
      return [];
    }
  }

  // Remove a saved payment method
  async removePaymentMethod(paymentMethodId: string): Promise<boolean> {
    try {
      const response = await fetch(`/api/payment-methods/${paymentMethodId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return result.removed;
    } catch (error) {
      console.error('🧪 Error removing payment method:', error);
      return false;
    }
  }
}

// Export singleton instance
export const stripeService = StripeService.getInstance();
