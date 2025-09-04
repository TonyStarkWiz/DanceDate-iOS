# 🚀 DanceDate iOS App Store Deployment Guide

## 📋 Pre-Flight Checklist

### ✅ Apple Developer Account Setup
- [ ] Active Apple Developer Program account ($99/year)
- [ ] Admin or App Manager role in App Store Connect
- [ ] App Store Connect app record created
- [ ] Bundle ID: `com.antho.dancedate` registered

### ✅ App Configuration
- [ ] App icon: 1024×1024 PNG (no transparency)
- [ ] App screenshots for all required iPhone sizes
- [ ] App Privacy questionnaire completed
- [ ] Export compliance answered (HTTPS = encryption exemption)

## 🔧 Step-by-Step Deployment Process

### 1. Install EAS CLI & Login
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to your Expo account
eas login

# Configure EAS for your project
eas build:configure
```

### 2. Update Configuration Files

#### Update `eas.json` with your Apple credentials:
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      }
    }
  }
}
```

#### Get your App Store Connect App ID:
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. My Apps → DanceDate → App Information
3. Copy the App ID (numeric value)

#### Get your Apple Team ID:
1. Go to [Apple Developer](https://developer.apple.com)
2. Membership → Team ID (10-character string)

### 3. Build for Production
```bash
# Build iOS production binary
eas build -p ios --profile production

# Monitor build progress
eas build:list
```

### 4. Submit to App Store Connect
```bash
# Submit the latest build
eas submit -p ios --latest

# Or submit a specific build
eas submit -p ios --id [BUILD_ID]
```

### 5. App Store Connect Setup

#### Create App Record (if not done):
1. App Store Connect → My Apps → + → New App
2. Platform: iOS
3. Name: DanceDate
4. Bundle ID: com.antho.dancedate
5. SKU: dancedate-ios-2024
6. Primary Language: English

#### Fill App Information:
- **Subtitle**: "Find Your Perfect Dance Partner"
- **Category**: Social Networking
- **Age Rating**: 12+ (Mild Suggestive Content)
- **Content Rights**: No
- **App Privacy**: Complete questionnaire

#### Upload Screenshots (Required Sizes):
- **iPhone 6.7" Display**: 1290 x 2796 px
- **iPhone 6.5" Display**: 1242 x 2688 px
- **iPhone 5.5" Display**: 1242 x 2208 px
- **iPhone 4.7" Display**: 750 x 1334 px

#### Add Build:
1. App Store tab → Prepare for Submission
2. Select your processed build under "Build"
3. Add review notes and demo account

### 6. Submit for Review
1. Click "Submit for Review"
2. Wait for Apple's review (typically 1-3 days)
3. Address any issues if rejected
4. Choose release method when approved

## 🎯 App Store Optimization

### Keywords for App Store Search:
- dance dating
- dance partner finder
- salsa dating
- dance events
- social dance
- dance community
- partner dancing
- dance social

### App Description Template:
```
Find Your Perfect Dance Partner! 💃🕺

DanceDate is the premier app for dancers looking to connect with like-minded partners. Whether you're into Salsa, Bachata, Tango, Swing, or Ballroom, find your perfect match and start dancing together!

✨ FEATURES:
• Find dance partners in your area
• Discover local dance events
• Real-time chat with matches
• Share dance photos and videos
• Get notified about dance events
• Connect with the dance community

🎭 DANCE STYLES:
• Salsa & Bachata
• Tango & Argentine Tango
• Swing & Lindy Hop
• Ballroom & Latin
• Kizomba & Zouk
• And many more!

🔒 SAFETY & PRIVACY:
• Verified profiles
• Safe messaging system
• Privacy controls
• Report inappropriate behavior

Join thousands of dancers who have found their perfect partners through DanceDate. Download now and start your dance journey!

#DanceDate #DancePartner #DanceCommunity #Salsa #Bachata #Tango
```

## 🚨 Common Rejection Issues & Fixes

### 1. Missing Privacy Manifest
- ✅ Add PrivacyInfo.xcprivacy file
- ✅ Update all third-party SDKs to latest versions
- ✅ Ensure SDKs have their own privacy manifests

### 2. Permission Strings
- ✅ All permissions have clear, user-friendly descriptions
- ✅ No generic or vague permission text

### 3. App Crashes
- ✅ Test on physical devices before submission
- ✅ Fix all crashes reported in TestFlight
- ✅ Ensure stable performance

### 4. Missing Demo Account
- ✅ Provide clear demo credentials
- ✅ Include step-by-step instructions
- ✅ Ensure all features are accessible

### 5. Payment Issues
- ✅ Use StoreKit for digital goods
- ✅ Don't link to external payment systems
- ✅ Follow Apple's payment guidelines

## 📱 Version Management

### Update Version Numbers:
```json
{
  "expo": {
    "version": "1.0.0",        // Marketing version
    "ios": {
      "buildNumber": "1"       // Build number (increment each submission)
    }
  }
}
```

### Version History:
- v1.0.0 (Build 1) - Initial release
- v1.0.1 (Build 2) - Bug fixes
- v1.1.0 (Build 3) - New features

## 🔄 Continuous Deployment

### Automated Workflow:
```bash
# Update version
npm version patch

# Build and submit
eas build -p ios --profile production
eas submit -p ios --latest
```

### Pre-submission Checklist:
- [ ] Version and build number incremented
- [ ] All permissions have proper descriptions
- [ ] App icon and screenshots updated
- [ ] Privacy questionnaire completed
- [ ] Export compliance answered
- [ ] Demo account provided
- [ ] Review notes added
- [ ] Tested on physical device

## 📞 Support & Resources

### Apple Developer Resources:
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Apple Developer Documentation](https://developer.apple.com/documentation/)

### Expo Resources:
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [Expo Discord Community](https://discord.gg/expo)

### DanceDate Specific:
- Bundle ID: com.antho.dancedate
- App Store Connect App ID: [Get from App Store Connect]
- Apple Team ID: [Get from Apple Developer]
- EAS Project ID: fc1e1cb9-f859-4555-b7aa-a862feb816e6

---

**Ready to deploy?** Follow this guide step by step, and your DanceDate app will be live on the App Store! 🎉
