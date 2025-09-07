// Platform-Specific Payment Service
// Handles StoreKit for iOS and Stripe for web/Android
// Note: For Expo Go development, we simulate StoreKit functionality

import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

export interface PaymentProduct {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  productId?: string;
  error?: string;
}

export class PaymentService {
  private static instance: PaymentService;
  private isInitialized = false;

  // App Store Connect product IDs (these need to be created in App Store Connect)
  private readonly iOS_PRODUCTS = {
    monthly: 'premium_monthly_1499',
    annual: 'premium_annual_14999'
  };

  // Stripe price IDs (these are your existing Stripe products)
  private readonly STRIPE_PRICE_IDS = {
    monthly: 'price_1S1owyBbx323AwXG6K38Xemb',
    annual: 'price_1S1oyZBbx323AwXGlCne4izj'
  };

  constructor() {
    this.initialize();
  }

  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  private async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      if (Platform.OS === 'ios') {
        console.log('🧪 Initializing StoreKit simulation for iOS (Expo Go)');
        // Note: In production with EAS Build, you would use:
        // await InAppPurchases.connectAsync();
        this.isInitialized = true;
        console.log('🧪 StoreKit simulation initialized successfully');
      } else {
        console.log('🧪 Skipping StoreKit initialization for non-iOS platform');
        this.isInitialized = true;
      }
    } catch (error) {
      console.error('🧪 Payment service initialization error:', error);
      this.isInitialized = false;
    }
  }

  // Main payment handler - routes to platform-specific implementation
  public async processPayment(productId: string, userEmail?: string): Promise<PaymentResult> {
    console.log('🧪 Processing payment for product:', productId, 'on platform:', Platform.OS);

    if (Platform.OS === 'ios') {
      // Check if we're in TestFlight or production build
      if (this.isTestFlightOrProduction()) {
        return this.processRealStoreKitPayment(productId);
      } else {
        return this.processiOSPayment(productId); // Expo Go simulation
      }
    } else {
      return this.processStripePayment(productId, userEmail);
    }
  }

  // Detect if we're in TestFlight or production build (not Expo Go)
  private isTestFlightOrProduction(): boolean {
    // In TestFlight/production, __DEV__ is false and we have real native modules
    return !__DEV__ && Platform.OS === 'ios';
  }

  // Real StoreKit implementation for TestFlight/Production
  private async processRealStoreKitPayment(productId: string): Promise<PaymentResult> {
    try {
      console.log('🧪 Starting REAL StoreKit payment for:', productId);

      // Get the App Store Connect product ID
      const appStoreProductId = this.getiOSProductId(productId);
      if (!appStoreProductId) {
        return {
          success: false,
          error: 'Invalid product ID for iOS'
        };
      }

      console.log('🧪 Using App Store product ID:', appStoreProductId);

      // TODO: Implement real StoreKit integration
      // You'll need to:
      // 1. Install expo-in-app-purchases
      // 2. Configure App Store Connect products
      // 3. Uncomment the real StoreKit code below
      
      // For now, return an error to prevent TestFlight issues
      return {
        success: false,
        error: 'Real StoreKit integration not yet implemented. Please use Expo Go for testing.',
        productId
      };

      // Real StoreKit code (uncomment when ready):
      // const result = await InAppPurchases.purchaseItemAsync(appStoreProductId);
      // return {
      //   success: result.responseCode === InAppPurchases.IAPResponseCode.OK,
      //   transactionId: result.transactionId,
      //   productId: appStoreProductId
      // };

    } catch (error) {
      console.error('🧪 Real StoreKit payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Real StoreKit payment failed',
        productId
      };
    }
  }

  // iOS StoreKit implementation (simulated for Expo Go)
  private async processiOSPayment(productId: string): Promise<PaymentResult> {
    try {
      console.log('🧪 Starting iOS StoreKit payment simulation for:', productId);

      // Get the App Store Connect product ID
      const appStoreProductId = this.getiOSProductId(productId);
      if (!appStoreProductId) {
        return {
          success: false,
          error: 'Invalid product ID for iOS'
        };
      }

      console.log('🧪 Using App Store product ID:', appStoreProductId);

      // Simulate StoreKit purchase for Expo Go development
      // In production with EAS Build, you would use:
      // const result = await InAppPurchases.purchaseItemAsync(appStoreProductId);
      
      return new Promise((resolve) => {
        // Simulate the iOS In-App Purchase dialog
        setTimeout(() => {
          console.log('🧪 iOS payment simulation completed');
          resolve({
            success: true,
            transactionId: `ios_txn_${Date.now()}`,
            productId: appStoreProductId
          });
        }, 2000); // Simulate 2-second processing time
      });

    } catch (error) {
      console.error('🧪 iOS payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'iOS payment failed',
        productId
      };
    }
  }

  // Web/Android Stripe implementation
  private async processStripePayment(productId: string, userEmail?: string): Promise<PaymentResult> {
    try {
      console.log('🧪 Starting Stripe payment for:', productId);

      // Get the Stripe price ID
      const stripePriceId = this.getStripePriceId(productId);
      if (!stripePriceId) {
        return {
          success: false,
          error: 'Invalid product ID for Stripe'
        };
      }

      console.log('🧪 Using Stripe price ID:', stripePriceId);

      // Create checkout session via your backend
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: stripePriceId,
          userId: 'current_user_id', // Replace with actual user ID
          planId: productId,
          successUrl: 'https://yourdomain.com/premium/success?session_id={CHECKOUT_SESSION_ID}',
          cancelUrl: 'https://yourdomain.com/premium/cancel',
          customerEmail: userEmail || 'user@example.com'
        })
      });

      console.log('🧪 Stripe API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🧪 Stripe API error:', errorText);
        return {
          success: false,
          error: `Stripe API error: ${response.status} - ${errorText}`,
          productId
        };
      }

      const checkoutSession = await response.json();
      console.log('🧪 Stripe checkout session created:', checkoutSession.sessionId);

      // Open Stripe Checkout in system browser (not WebView)
      const checkoutUrl = `https://checkout.stripe.com/c/pay/${checkoutSession.sessionId}`;
      console.log('🧪 Opening Stripe Checkout in browser:', checkoutUrl);
      
      await WebBrowser.openBrowserAsync(checkoutUrl);

      // For demo purposes, we'll simulate success
      // In production, you'd handle the success URL callback
      return {
        success: true,
        transactionId: checkoutSession.sessionId,
        productId
      };

    } catch (error) {
      console.error('🧪 Stripe payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Stripe payment failed',
        productId
      };
    }
  }

  // Get iOS App Store product ID
  private getiOSProductId(productId: string): string | null {
    switch (productId) {
      case 'monthly':
        return this.iOS_PRODUCTS.monthly;
      case 'annual':
        return this.iOS_PRODUCTS.annual;
      default:
        return null;
    }
  }

  // Get Stripe price ID
  private getStripePriceId(productId: string): string | null {
    switch (productId) {
      case 'monthly':
        return this.STRIPE_PRICE_IDS.monthly;
      case 'annual':
        return this.STRIPE_PRICE_IDS.annual;
      default:
        return null;
    }
  }

  // Restore purchases (iOS only) - simulated for Expo Go
  public async restorePurchases(): Promise<PaymentResult> {
    if (Platform.OS !== 'ios') {
      return {
        success: false,
        error: 'Restore purchases only available on iOS'
      };
    }

    try {
      console.log('🧪 Restoring iOS purchases (simulated)');
      
      // Simulate restore purchases for Expo Go development
      // In production with EAS Build, you would use:
      // const result = await InAppPurchases.getPurchaseHistoryAsync();
      
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('🧪 Restore purchases simulation completed');
          resolve({
            success: true,
            transactionId: 'restore_completed'
          });
        }, 1500);
      });

    } catch (error) {
      console.error('🧪 Restore purchases error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Restore purchases failed'
      };
    }
  }

  // Get available products
  public async getAvailableProducts(): Promise<PaymentProduct[]> {
    const products: PaymentProduct[] = [
      {
        id: 'monthly',
        name: 'Premium Monthly',
        price: '$14.99',
        period: 'month',
        features: [
          'Unlimited Google Custom Search',
          'Advanced Partner Matching',
          'Unlimited Chat Messages',
          'Priority Support',
          'Early Access to New Features',
          'Premium Profile Badges'
        ]
      },
      {
        id: 'annual',
        name: 'Premium Annual',
        price: '$149.99',
        period: 'year',
        features: [
          'All Monthly Features',
          'Save 17% ($29.89)',
          '2 Months Free',
          'VIP Status',
          'Priority App Updates',
          'Exclusive Event Access'
        ]
      }
    ];

    return products;
  }

  // Check if payment is available on current platform
  public isPaymentAvailable(): boolean {
    return Platform.OS === 'ios' || Platform.OS === 'web' || Platform.OS === 'android';
  }

  // Get platform-specific payment method name
  public getPaymentMethodName(): string {
    if (Platform.OS === 'ios') {
      return 'In-App Purchase';
    } else {
      return 'Stripe Checkout';
    }
  }

  // Cleanup - simulated for Expo Go
  public async disconnect(): Promise<void> {
    if (Platform.OS === 'ios' && this.isInitialized) {
      try {
        // Simulate StoreKit disconnect for Expo Go development
        // In production with EAS Build, you would use:
        // await InAppPurchases.disconnectAsync();
        console.log('🧪 StoreKit disconnect simulation completed');
      } catch (error) {
        console.error('🧪 StoreKit disconnect error:', error);
      }
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;
