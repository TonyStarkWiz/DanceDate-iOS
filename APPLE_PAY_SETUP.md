# 🍎 Apple Pay Setup Guide for DanceDate

This guide will walk you through setting up Apple Pay for your DanceDate iOS app.

## 📋 Prerequisites

- ✅ **Apple Developer Account** (paid membership - $99/year)
- ✅ **iOS App** with bundle ID: `com.antho.dancedate`
- ✅ **Xcode** installed on macOS
- ✅ **Physical iOS device** for testing (Apple Pay doesn't work in simulator)

## 🚀 Step 1: Apple Developer Console Setup

### 1.1 Enable Apple Pay Capability

1. Go to [Apple Developer Console](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Select **Identifiers** → **App IDs**
4. Find your app ID: `com.antho.dancedate`
5. Click on it and scroll to **Capabilities**
6. **Check the box** for **Apple Pay**
7. Click **Save**

### 1.2 Create Merchant ID

1. In **Identifiers**, click the **+** button
2. Select **Merchant IDs** → **Continue**
3. Fill in:
   - **Description**: `DanceDate Merchant ID`
   - **Identifier**: `merchant.com.antho.dancedate`
4. Click **Continue** → **Register**

### 1.3 Configure Payment Processing Certificate

1. In **Certificates**, click the **+** button
2. Select **Apple Pay Payment Processing Certificate**
3. Choose your **Merchant ID**: `merchant.com.antho.dancedate`
4. Download and install the certificate

## 🔧 Step 2: Xcode Project Configuration

### 2.1 Enable Apple Pay Capability

1. Open your project in **Xcode**
2. Select your project → **Target** → **Signing & Capabilities**
3. Click **+ Capability**
4. Add **Apple Pay**
5. Configure:
   - **Merchant ID**: `merchant.com.antho.dancedate`
   - **Supported Networks**: Visa, MasterCard, American Express

### 2.2 Update Info.plist

Add these keys to your `Info.plist`:

```xml
<key>NSApplePayUsageDescription</key>
<string>DanceDate uses Apple Pay to process secure payments for premium features and event bookings.</string>
```

## 💳 Step 3: Payment Processing Backend

### 3.1 Choose Payment Processor

**Recommended: Stripe**
- Easy integration
- Excellent documentation
- Supports Apple Pay
- Competitive pricing

**Alternative: PayPal**
- Good for international payments
- Built-in fraud protection

### 3.2 Stripe Integration

1. **Install Stripe SDK**:
   ```bash
   npm install @stripe/stripe-react-native
   ```

2. **Initialize Stripe** in your app:
   ```typescript
   import { StripeProvider } from '@stripe/stripe-react-native';
   
   const stripePublishableKey = 'pk_test_your_key_here';
   
   export default function App() {
     return (
       <StripeProvider publishableKey={stripePublishableKey}>
         {/* Your app content */}
       </StripeProvider>
     );
   }
   ```

## 🎯 Step 4: Testing Apple Pay

### 4.1 Test Environment

1. **Use Test Cards**:
   - Visa: `4000 0000 0000 0002`
   - MasterCard: `5200 8282 8282 8210`
   - American Express: `3782 822463 10005`

2. **Test on Physical Device**:
   - Apple Pay doesn't work in iOS Simulator
   - Use iPhone with Touch ID/Face ID
   - Ensure device has Apple Pay set up

### 4.2 Test Payment Flow

1. **Select Payment Option** in your app
2. **Tap Apple Pay Button**
3. **Authenticate** with Touch ID/Face ID
4. **Confirm Payment** amount
5. **Verify Success** in your backend

## 🔒 Step 5: Security & Compliance

### 5.1 PCI Compliance

- **Don't store** credit card numbers
- **Use tokens** from Apple Pay
- **Encrypt** all payment data
- **Follow** PCI DSS guidelines

### 5.2 Data Privacy

- **Minimize** data collection
- **Secure** data transmission
- **Comply** with GDPR/CCPA
- **Document** data usage

## 📱 Step 6: User Experience

### 6.1 Apple Pay Button Guidelines

- **Use official** Apple Pay button
- **Follow** Apple's design guidelines
- **Test** on different screen sizes
- **Ensure** accessibility compliance

### 6.2 Error Handling

- **Graceful** fallbacks
- **Clear** error messages
- **Retry** mechanisms
- **Support** contact options

## 🚀 Step 7: Production Deployment

### 7.1 App Store Review

1. **Test thoroughly** before submission
2. **Document** payment flow
3. **Provide** test account credentials
4. **Explain** Apple Pay usage

### 7.2 Go Live Checklist

- [ ] **Apple Pay capability** enabled
- [ ] **Merchant ID** configured
- [ ] **Payment certificates** installed
- [ ] **Backend integration** complete
- [ ] **Testing** completed
- [ ] **Error handling** implemented
- [ ] **User support** ready

## 🐛 Troubleshooting

### Common Issues

1. **"Apple Pay Not Available"**
   - Check device compatibility
   - Verify Apple Pay setup
   - Ensure capability enabled

2. **Payment Declined**
   - Verify test card numbers
   - Check backend integration
   - Review error logs

3. **Merchant ID Issues**
   - Confirm identifier matches
   - Check certificate validity
   - Verify Xcode configuration

## 📚 Additional Resources

- [Apple Pay Developer Documentation](https://developer.apple.com/apple-pay/)
- [Stripe Apple Pay Integration](https://stripe.com/docs/apple-pay)
- [Apple Pay Design Guidelines](https://developer.apple.com/design/human-interface-guidelines/apple-pay)
- [Payment Processing Best Practices](https://developer.apple.com/apple-pay/get-started/)

## 🎉 Next Steps

1. **Complete** the setup steps above
2. **Test** Apple Pay integration
3. **Integrate** with your backend
4. **Submit** to App Store
5. **Monitor** payment success rates

---

**Need Help?** Check the troubleshooting section or refer to the official documentation links above.
