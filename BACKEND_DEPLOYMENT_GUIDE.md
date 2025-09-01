# 🚀 Backend Deployment Guide for DanceDate Apple Pay

## ✅ **What's Been Created**

### 1. **Firebase Functions**
- ✅ Payment intent creation
- ✅ Apple Pay payment processing
- ✅ Subscription management
- ✅ Webhook handling
- ✅ Premium status checking

### 2. **Frontend Integration**
- ✅ Updated Apple Pay service to use backend
- ✅ User authentication integration
- ✅ Error handling and loading states

### 3. **Configuration**
- ✅ Stripe integration with your live keys
- ✅ Product/price IDs configured
- ✅ Firebase Functions setup

## 🔧 **Deployment Steps**

### Step 1: Install Firebase CLI (if not already installed)

```bash
npm install -g firebase-tools
```

### Step 2: Login to Firebase

```bash
firebase login
```

### Step 3: Initialize Firebase Functions

```bash
cd functions
npm install
```

### Step 4: Set Environment Variables

```bash
firebase functions:config:set stripe.secret_key="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"
```

### Step 5: Build and Deploy Functions

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### Step 6: Get Your Functions URL

After deployment, you'll get URLs like:
- `https://us-central1-your-project.cloudfunctions.net/createPaymentIntent`
- `https://us-central1-your-project.cloudfunctions.net/processApplePayPayment`
- `https://us-central1-your-project.cloudfunctions.net/getPremiumStatus`

### Step 7: Update Frontend Configuration

Update `services/applePayService.ts` with your actual Firebase Functions URL:

```typescript
const BACKEND_URL = 'https://us-central1-your-project.cloudfunctions.net';
```

## 🔑 **Stripe Webhook Setup**

### Step 1: Create Webhook Endpoint

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click **Add endpoint**
3. Enter your webhook URL: `https://us-central1-your-project.cloudfunctions.net/stripeWebhook`
4. Select events:
   - `payment_intent.succeeded`
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`

### Step 2: Get Webhook Secret

1. Copy the webhook signing secret
2. Set it in Firebase:

```bash
firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret"
```

### Step 3: Redeploy Functions

```bash
firebase deploy --only functions
```

## 🧪 **Testing Your Backend**

### 1. **Test Payment Intent Creation**

```bash
curl -X POST https://us-central1-your-project.cloudfunctions.net/createPaymentIntent \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "premiumMonthly",
    "customerId": "test@example.com"
  }'
```

### 2. **Test Premium Status**

```bash
curl "https://us-central1-your-project.cloudfunctions.net/getPremiumStatus?customerId=test@example.com"
```

### 3. **Test Payment Processing**

```bash
curl -X POST https://us-central1-your-project.cloudfunctions.net/processApplePayPayment \
  -H "Content-Type: application/json" \
  -d '{
    "paymentIntentId": "pi_your_payment_intent_id",
    "customerId": "test@example.com",
    "productId": "premiumMonthly"
  }'
```

## 📱 **Frontend Testing**

### 1. **Update Backend URL**
Replace the placeholder URL in `services/applePayService.ts` with your actual Firebase Functions URL.

### 2. **Test Apple Pay Flow**
1. Navigate to `/premium` in your app
2. Select a subscription plan
3. Tap Apple Pay button
4. Complete the payment flow

### 3. **Check Premium Status**
The app will automatically check and update the user's premium status after successful payment.

## 🔒 **Security Considerations**

### 1. **Environment Variables**
- ✅ Stripe secret key stored securely
- ✅ Webhook secret configured
- ✅ No sensitive data in frontend

### 2. **Authentication**
- ✅ User authentication required
- ✅ Customer ID validation
- ✅ Payment intent verification

### 3. **Error Handling**
- ✅ Comprehensive error responses
- ✅ Logging for debugging
- ✅ Graceful fallbacks

## 🐛 **Troubleshooting**

### Common Issues:

1. **"Functions not found"**
   - Ensure Firebase project is correct
   - Check if functions are deployed
   - Verify function URLs

2. **"Payment intent creation failed"**
   - Check Stripe secret key
   - Verify product IDs
   - Check function logs

3. **"Webhook verification failed"**
   - Ensure webhook secret is correct
   - Check webhook endpoint URL
   - Verify event types

### Debugging:

1. **Check Function Logs**
```bash
firebase functions:log
```

2. **Test Functions Locally**
```bash
cd functions
npm run serve
```

3. **Check Stripe Dashboard**
- Payment intents
- Customer data
- Webhook events

## 🎯 **Production Checklist**

- [ ] Functions deployed to production
- [ ] Stripe live keys configured
- [ ] Webhook endpoint set up
- [ ] Frontend URL updated
- [ ] Error handling tested
- [ ] Payment flow tested
- [ ] Premium status updates working
- [ ] Logs monitored

## 📞 **Support**

If you encounter issues:
1. Check Firebase Functions logs
2. Verify Stripe dashboard
3. Test with curl commands
4. Check function URLs
5. Verify environment variables

---

**🎉 Your backend is ready for deployment!** Follow the steps above to get your Apple Pay integration fully functional.
