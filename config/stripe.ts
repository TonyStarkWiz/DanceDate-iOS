// Stripe configuration for DanceDate
export const STRIPE_CONFIG = {
  // Live keys (replace with test keys for development)
  publishableKey: 'pk_live_your_publishable_key_here', // Replace with your actual Stripe publishable key
  
  // Product IDs
  products: {
    premiumMonthly: {
      id: 'prod_SxkRN2JNoOElpt',
      priceId: 'price_1S1owyBbx323AwXG6K38Xemb',
      name: 'Premium Monthly',
      price: 14.99,
      currency: 'USD',
      interval: 'month'
    },
    premiumAnnual: {
      id: 'prod_SxkTsDKCBTkAEr',
      priceId: 'price_1S1oyZBbx323AwXGlCne4izj',
      name: 'Premium Annual',
      price: 149.99,
      currency: 'USD',
      interval: 'year'
    }
  },
  
  // Apple Pay configuration
  applePay: {
    merchantIdentifier: 'merchant.com.antho.dancedate',
    supportedNetworks: ['visa', 'mastercard', 'amex'],
    merchantCapabilities: ['supports3DS', 'supportsCredit', 'supportsDebit'],
    countryCode: 'US',
    currencyCode: 'USD'
  }
};

// Helper function to get product by ID
export const getProductById = (productId: string) => {
  return Object.values(STRIPE_CONFIG.products).find(product => product.id === productId);
};

// Helper function to get product by price ID
export const getProductByPriceId = (priceId: string) => {
  return Object.values(STRIPE_CONFIG.products).find(product => product.priceId === priceId);
};
