# 🚀 Stripe Integration Setup Guide

## Overview
This app now uses **real Stripe payments** with the **Payment Intents API** and `setup_future_usage` to save payment methods for future use. This is perfect for subscription-based services.

## 🔑 Environment Variables Required

Create a `.env.local` file in your project root with these variables:

```bash
# Stripe API Keys (LIVE keys from your Stripe dashboard)
STRIPE_PUBLISHABLE_KEY=pk_live_51JCtz2Bbx323AwXGxhzJN5CZb5MjZNvlXGFbkzkUEHkJ9OMn6OExWYfghF4k1VMbj58dTz1E9iiveEeTfFVxsg07005joJc63B
STRIPE_SECRET_KEY=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

# Environment
NODE_ENV=development

# Google Custom Search API
GOOGLE_CUSTOM_SEARCH_API_KEY=AIzaSyBTIR8d1fRiWDH5SUKmgZwyGXnF1s1xfG0
GOOGLE_CUSTOM_SEARCH_ENGINE_ID=c63b840d0b01d4d28
```

## 🎯 How Payment Intents with setup_future_usage Work

### 1. **Payment Intent Creation**
- Creates a payment session with amount
- Sets `setup_future_usage` to save payment method
- Ready for immediate payment + future use

### 2. **Payment Method Collection**
- User enters card details
- Card is validated (Luhn algorithm)
- Expiry and CVV are checked

### 3. **Payment Intent Confirmation**
- Payment method is attached to customer
- Payment Intent is confirmed
- Card is charged immediately AND saved for future use

### 4. **Future Billing**
- Uses saved payment method
- Can charge saved cards later
- Handles recurring billing automatically

## 🔒 Security Features

- **No card data stored** in your app
- **Stripe handles all sensitive data**
- **PCI compliance** maintained
- **Encrypted transmission** via HTTPS

## 📱 User Experience

### **Before (Simulated):**
- Click upgrade → 3-second delay → Success

### **After (Real Stripe):**
- Click upgrade → Payment Intent created
- Enter card details → Real validation
- Pay immediately + Save card → Professional flow

## 🧪 Testing

### **Test Card Numbers:**
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`

### **Test Flow:**
1. Click any upgrade button
2. Fill in payment form
3. See real Stripe processing
4. Get subscription confirmation

## 🚨 Important Notes

### **Live Keys vs Test Keys:**
- **Current**: Using LIVE Stripe keys
- **Production**: Keep using live keys
- **Development**: Consider switching to test keys

### **Backend Requirements:**
- API endpoints are created
- Stripe SDK is installed
- Environment variables must be set

### **Customer Management:**
- Customers are created automatically
- Payment methods are attached
- Subscriptions are managed

## 🔧 Troubleshooting

### **Common Issues:**
1. **"Setup Intent not ready"** → Check environment variables
2. **"Payment failed"** → Check Stripe dashboard logs
3. **"API error"** → Verify backend endpoints

### **Debug Steps:**
1. Check browser console for logs
2. Verify `.env.local` file exists
3. Restart development server
4. Check Stripe dashboard for errors

## 🎉 Benefits of Setup Intents

- **No upfront charges** for users
- **Better conversion rates**
- **Professional payment experience**
- **Automatic recurring billing**
- **Compliance with regulations**

## 📞 Support

If you encounter issues:
1. Check Stripe dashboard logs
2. Verify API key permissions
3. Test with Stripe test cards
4. Check network requests in browser

---

**Ready to test real payments?** 🚀

1. Create `.env.local` file
2. Restart development server
3. Click upgrade button
4. Enter test card details
5. See real Stripe processing!
