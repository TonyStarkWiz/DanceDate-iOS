# 🍎 Apple Pay Setup Complete for DanceDate

## ✅ **What's Been Implemented**

### 1. **Stripe Integration**
- ✅ Stripe React Native SDK installed
- ✅ Configuration file with your product/price IDs
- ✅ Apple Pay service with Stripe integration
- ✅ Premium subscription screen

### 2. **Product Configuration**
- ✅ **Premium Monthly**: $14.99 USD
  - Product ID: `prod_SxkRN2JNoOElpt`
  - Price ID: `price_1S1owyBbx323AwXG6K38Xemb`
- ✅ **Premium Annual**: $149.99 USD
  - Product ID: `prod_SxkTsDKCBTkAEr`
  - Price ID: `price_1S1oyZBbx323AwXGlCne4izj`

### 3. **UI Components**
- ✅ Apple Pay button component
- ✅ Premium subscription screen
- ✅ Navigation integration
- ✅ Loading states and error handling

## 🔧 **Next Steps to Complete Setup**

### Step 1: Get Your Stripe Keys

1. **Go to [Stripe Dashboard](https://dashboard.stripe.com/)**
2. **Navigate to Developers → API Keys**
3. **Copy your Publishable Key** (starts with `pk_test_` or `pk_live_`)
4. **Update the configuration** in `config/stripe.ts`:

```typescript
publishableKey: 'pk_test_your_actual_key_here',
```

### Step 2: Apple Developer Console Setup

1. **Enable Apple Pay Capability**:
   - Go to [Apple Developer Console](https://developer.apple.com/account/)
   - Navigate to **Certificates, Identifiers & Profiles**
   - Select **Identifiers** → **App IDs**
   - Find your app ID: `com.antho.dancedate`
   - Check **Apple Pay** capability
   - Click **Save**

2. **Create Merchant ID**:
   - In **Identifiers**, click **+**
   - Select **Merchant IDs** → **Continue**
   - Description: `DanceDate Merchant ID`
   - Identifier: `merchant.com.antho.dancedate`
   - Click **Continue** → **Register**

3. **Configure Payment Processing Certificate**:
   - In **Certificates**, click **+**
   - Select **Apple Pay Payment Processing Certificate**
   - Choose your Merchant ID: `merchant.com.antho.dancedate`
   - Download and install the certificate

### Step 3: Xcode Configuration

1. **Open your project in Xcode**
2. **Select your project → Target → Signing & Capabilities**
3. **Click + Capability**
4. **Add Apple Pay**
5. **Configure**:
   - Merchant ID: `merchant.com.antho.dancedate`
   - Supported Networks: Visa, MasterCard, American Express

### Step 4: Update Info.plist

Add to your `ios/DanceDate/Info.plist`:

```xml
<key>NSApplePayUsageDescription</key>
<string>DanceDate uses Apple Pay to process secure payments for premium features and event bookings.</string>
```

## 🧪 **Testing Your Setup**

### 1. **Test the Premium Screen**
- Navigate to `/premium` in your app
- Or tap "View Premium Plans" from the welcome screen
- You should see both subscription options

### 2. **Test Apple Pay Flow**
- Select a subscription plan
- Tap the Apple Pay button
- You should see a payment confirmation dialog
- Complete the simulated payment

### 3. **Test on Physical Device**
- Apple Pay only works on physical iOS devices
- Ensure Apple Pay is set up on the device
- Use test cards for testing

## 🔑 **Test Cards for Development**

- **Visa**: `4000 0000 0000 0002`
- **MasterCard**: `5200 8282 8282 8210`
- **American Express**: `3782 822463 10005`

## 🚀 **Production Deployment**

### 1. **Update to Live Keys**
- Replace test keys with live keys in `config/stripe.ts`
- Update merchant ID for production
- Test thoroughly with live keys

### 2. **App Store Submission**
- Ensure Apple Pay capability is enabled
- Provide test account credentials to Apple
- Document the payment flow
- Test on multiple devices

## 📱 **Files Created/Updated**

- ✅ `config/stripe.ts` - Stripe configuration with your product IDs
- ✅ `services/applePayService.ts` - Updated with Stripe integration
- ✅ `components/screens/PremiumSubscriptionScreen.tsx` - Premium subscription UI
- ✅ `components/ui/ApplePayButton.tsx` - Enhanced Apple Pay button
- ✅ `app/premium.tsx` - Premium subscription route
- ✅ `app/_layout.tsx` - Added premium route to navigation

## 🎯 **Current Status**

**Ready for Testing**: ✅
- All UI components implemented
- Stripe integration ready
- Apple Pay flow simulated
- Navigation working

**Needs Configuration**: ⚠️
- Stripe publishable key
- Apple Developer Console setup
- Xcode Apple Pay capability
- Physical device testing

## 🆘 **Troubleshooting**

### Common Issues:

1. **"Apple Pay Not Available"**
   - Check device compatibility
   - Verify Apple Pay setup on device
   - Ensure capability enabled in Xcode

2. **Payment Declined**
   - Verify test card numbers
   - Check Stripe dashboard for errors
   - Review console logs

3. **Merchant ID Issues**
   - Confirm identifier matches exactly
   - Check certificate validity
   - Verify Xcode configuration

## 📞 **Support**

If you encounter issues:
1. Check the console logs for error messages
2. Verify all configuration steps are complete
3. Test on a physical iOS device
4. Check Stripe dashboard for payment status

---

**🎉 Your Apple Pay integration is ready for testing!** Just complete the configuration steps above and you'll have a fully functional premium subscription system with Apple Pay.
