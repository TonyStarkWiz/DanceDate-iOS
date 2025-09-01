import { STRIPE_CONFIG } from '@/config/stripe';
import { Alert, Platform } from 'react-native';

// Apple Pay configuration
export interface ApplePayConfig {
  merchantIdentifier: string;
  supportedNetworks: string[];
  merchantCapabilities: string[];
  countryCode: string;
  currencyCode: string;
}

// Payment item interface
export interface PaymentItem {
  label: string;
  amount: number;
  type: 'final' | 'pending';
}

// Payment request interface
export interface PaymentRequest {
  items: PaymentItem[];
  total: PaymentItem;
  shippingContact?: any;
  billingContact?: any;
  productId?: string;
  priceId?: string;
}

// Payment result interface
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  error?: string;
  productId?: string;
  priceId?: string;
}

// Backend API endpoints
const BACKEND_URL = 'https://us-central1-dancelinkbackend.cloudfunctions.net';

export class ApplePayService {
  private config: ApplePayConfig;
  private isSupported: boolean = false;

  constructor() {
    this.config = STRIPE_CONFIG.applePay;
    this.checkSupport();
  }

  // Check if Apple Pay is supported on this device
  private async checkSupport(): Promise<void> {
    if (Platform.OS !== 'ios') {
      this.isSupported = false;
      return;
    }

    try {
      // In a real implementation, you'd check Apple Pay availability
      // For now, we'll assume it's supported on iOS
      this.isSupported = true;
    } catch (error) {
      console.error('🧪 Apple Pay not supported:', error);
      this.isSupported = false;
    }
  }

  // Check if Apple Pay is available
  public isApplePayAvailable(): boolean {
    return this.isSupported && Platform.OS === 'ios';
  }

  // Request payment authorization for premium subscription
  public async requestPremiumPayment(productId: string, userEmail: string): Promise<PaymentResult> {
    const product = STRIPE_CONFIG.products[productId as keyof typeof STRIPE_CONFIG.products];
    
    if (!product) {
      return {
        success: false,
        error: 'Invalid product ID'
      };
    }

    const request: PaymentRequest = {
      items: [
        {
          label: product.name,
          amount: product.price * 100, // Convert to cents
          type: 'final'
        }
      ],
      total: {
        label: product.name,
        amount: product.price * 100,
        type: 'final'
      },
      productId: product.id,
      priceId: product.priceId
    };

    return this.requestPayment(request, userEmail);
  }

  // Request payment authorization
  public async requestPayment(request: PaymentRequest, userEmail: string): Promise<PaymentResult> {
    if (!this.isApplePayAvailable()) {
      Alert.alert('Apple Pay Not Available', 'Apple Pay is not supported on this device.');
      return {
        success: false,
        error: 'Apple Pay not supported'
      };
    }

    try {
      console.log('🧪 Requesting Apple Pay payment:', request);
      
      // Step 1: Create payment intent with backend
      const paymentIntentResponse = await this.createPaymentIntent(request.productId!, userEmail);
      
      if (!paymentIntentResponse.success) {
        return {
          success: false,
          error: paymentIntentResponse.error,
          productId: request.productId,
          priceId: request.priceId
        };
      }

      // Step 2: Simulate Apple Pay confirmation (in real implementation, this would use Apple Pay APIs)
      return new Promise((resolve) => {
        Alert.alert(
          'Apple Pay Request',
          `Requesting payment for: ${request.total.label} - $${(request.total.amount / 100).toFixed(2)}`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve({
                success: false,
                error: 'Payment cancelled',
                productId: request.productId,
                priceId: request.priceId
              })
            },
            {
              text: 'Pay',
              onPress: () => this.processPaymentWithBackend(paymentIntentResponse.paymentIntentId!, userEmail, request.productId!).then(resolve)
            }
          ]
        );
      });

    } catch (error) {
      console.error('🧪 Apple Pay request failed:', error);
      Alert.alert('Payment Failed', 'Unable to process Apple Pay request.');
      return {
        success: false,
        error: 'Payment request failed',
        productId: request.productId,
        priceId: request.priceId
      };
    }
  }

  // Create payment intent with backend
  private async createPaymentIntent(productId: string, userEmail: string): Promise<{success: boolean, paymentIntentId?: string, error?: string}> {
    try {
      const response = await fetch(`${BACKEND_URL}/createPaymentIntent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          customerId: userEmail
        }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          paymentIntentId: data.paymentIntentId
        };
      } else {
        return {
          success: false,
          error: data.error || 'Failed to create payment intent'
        };
      }
    } catch (error) {
      console.error('🧪 Error creating payment intent:', error);
      return {
        success: false,
        error: 'Network error creating payment intent'
      };
    }
  }

  // Process payment with backend
  private async processPaymentWithBackend(paymentIntentId: string, userEmail: string, productId: string): Promise<PaymentResult> {
    try {
      console.log('🧪 Processing payment with backend:', { paymentIntentId, userEmail, productId });
      
      const response = await fetch(`${BACKEND_URL}/processApplePayPayment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentIntentId,
          customerId: userEmail,
          productId
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('🧪 Payment processed successfully:', data);
        
        Alert.alert('Payment Successful', 'Your payment has been processed successfully!');
        
        return {
          success: true,
          transactionId: data.paymentIntentId,
          productId,
          priceId: STRIPE_CONFIG.products[productId as keyof typeof STRIPE_CONFIG.products]?.priceId
        };
      } else {
        console.error('🧪 Payment processing failed:', data);
        Alert.alert('Payment Failed', data.error || 'Unable to process your payment. Please try again.');
        
        return {
          success: false,
          error: data.error || 'Payment processing failed',
          productId,
          priceId: STRIPE_CONFIG.products[productId as keyof typeof STRIPE_CONFIG.products]?.priceId
        };
      }

    } catch (error) {
      console.error('🧪 Payment processing failed:', error);
      Alert.alert('Payment Failed', 'Unable to process your payment. Please try again.');
      
      return {
        success: false,
        error: 'Payment processing failed',
        productId,
        priceId: STRIPE_CONFIG.products[productId as keyof typeof STRIPE_CONFIG.products]?.priceId
      };
    }
  }

  // Get user's premium status from backend
  public async getPremiumStatus(userEmail: string): Promise<{isPremium: boolean, subscriptionTier: string}> {
    try {
      const response = await fetch(`${BACKEND_URL}/getPremiumStatus?customerId=${encodeURIComponent(userEmail)}`);
      
      if (response.ok) {
        const data = await response.json();
        return {
          isPremium: data.isPremium || false,
          subscriptionTier: data.subscriptionTier || 'FREE'
        };
      } else {
        console.error('🧪 Failed to get premium status:', response.status);
        return {
          isPremium: false,
          subscriptionTier: 'FREE'
        };
      }
    } catch (error) {
      console.error('🧪 Error getting premium status:', error);
      return {
        isPremium: false,
        subscriptionTier: 'FREE'
      };
    }
  }

  // Get supported payment networks
  public getSupportedNetworks(): string[] {
    return this.config.supportedNetworks;
  }

  // Get merchant capabilities
  public getMerchantCapabilities(): string[] {
    return this.config.merchantCapabilities;
  }

  // Get available products
  public getAvailableProducts() {
    return STRIPE_CONFIG.products;
  }

  // Get product by ID
  public getProduct(productId: string) {
    return STRIPE_CONFIG.products[productId as keyof typeof STRIPE_CONFIG.products];
  }

  // Update configuration
  public updateConfig(newConfig: Partial<ApplePayConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}

// Export singleton instance
export const applePayService = new ApplePayService();
export default applePayService;
