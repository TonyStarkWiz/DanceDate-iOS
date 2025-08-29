# 🔐 Google OAuth Setup Guide for DanceDate iOS

## 📋 **Prerequisites**
- Google account
- Firebase project already configured
- Expo development environment

## 🚀 **Step 1: Google Cloud Console Setup**

### 1.1 Create/Select Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your existing Firebase project or create a new one
3. Ensure the project ID matches your Firebase project

### 1.2 Enable Google Sign-In API
1. In Google Cloud Console, go to **APIs & Services** > **Library**
2. Search for "Google Sign-In API" or "Google+ API"
3. Click on it and press **Enable**

### 1.3 Create OAuth 2.0 Client IDs
1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **OAuth client ID**
3. If prompted, configure the OAuth consent screen first

#### OAuth Consent Screen Setup:
- **User Type**: External (for testing) or Internal (for production)
- **App name**: DanceDate
- **User support email**: Your email
- **Developer contact information**: Your email
- **Scopes**: Add `email` and `profile`

#### Create OAuth Client IDs:

**Web Client ID (Primary):**
- Application type: **Web application**
- Name: `DanceDate Web Client`
- Authorized JavaScript origins:
  - `http://localhost:8081` (for development)
  - `https://your-domain.com` (for production)
- Authorized redirect URIs:
  - `http://localhost:8081` (for development)
  - `https://your-domain.com` (for production)

**iOS Client ID:**
- Application type: **iOS**
- Name: `DanceDate iOS Client`
- Bundle ID: `com.yourcompany.dancedateios` (replace with your actual bundle ID)

**Android Client ID:**
- Application type: **Android**
- Name: `DanceDate Android Client`
- Package name: `com.yourcompany.dancedateios` (replace with your actual package name)
- SHA-1 certificate fingerprint: (we'll get this in the next step)

## 📱 **Step 2: Get Android SHA-1 Certificate Fingerprint**

### 2.1 Development Build (Debug)
```bash
# Navigate to your project directory
cd dancedate-ios

# Get the debug SHA-1 fingerprint
npx expo credentials:manager
# Select Android > View all keystores
# Copy the SHA-1 fingerprint from the debug keystore
```

### 2.2 Production Build (Release)
```bash
# For production builds, you'll need the release keystore SHA-1
# This is generated when you build for production
```

## 🔧 **Step 3: Update Google Sign-In Configuration**

### 3.1 Update the Google Sign-In Service
Replace the placeholder client IDs in `services/googleSignIn.ts`:

```typescript
private clientIds = [
  'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',      // Web client ID
  'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',      // iOS client ID  
  'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',  // Android client ID
];
```

### 3.2 Update app.json Configuration
Add Google Sign-In configuration to your `app.json`:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json",
      "package": "com.yourcompany.dancedateios"
    },
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist",
      "bundleIdentifier": "com.yourcompany.dancedateios"
    },
    "plugins": [
      "@react-native-google-signin/google-signin"
    ]
  }
}
```

## 📄 **Step 4: Download Configuration Files**

### 4.1 Download google-services.json
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **General**
4. Scroll down to **Your apps** section
5. Click on your Android app (create one if it doesn't exist)
6. Download `google-services.json`
7. Place it in your project root

### 4.2 Download GoogleService-Info.plist
1. In Firebase Console, go to **Project Settings** > **General**
2. Scroll down to **Your apps** section
3. Click on your iOS app (create one if it doesn't exist)
4. Download `GoogleService-Info.plist`
5. Place it in your project root

## 🧪 **Step 5: Test Google Sign-In**

### 5.1 Update Test Credentials
In your `TestAuthScreen`, the Google Sign-In test will now work with real credentials.

### 5.2 Test Flow
1. Run the app
2. Navigate to Test Auth Screen
3. Click "Test Google Sign-In"
4. You should see the Google Sign-In popup
5. Select your Google account
6. Verify the sign-in completes successfully

## 🔍 **Step 6: Troubleshooting Common Issues**

### 6.1 "Developer Error" or "Invalid Client"
- Verify client IDs are correct
- Ensure OAuth consent screen is configured
- Check that APIs are enabled

### 6.2 "Network Error" or "Sign-In Failed"
- Verify internet connection
- Check Firebase configuration
- Ensure Google Sign-In API is enabled

### 6.3 "Package Name Mismatch"
- Verify bundle ID in app.json matches OAuth client ID
- Check that google-services.json is in the correct location

### 6.4 "SHA-1 Mismatch"
- Regenerate SHA-1 fingerprint
- Update OAuth client ID with new fingerprint
- Clear app cache and rebuild

## 📚 **Additional Resources**

- [Google Sign-In Documentation](https://developers.google.com/identity/sign-in/android)
- [Firebase Auth Documentation](https://firebase.google.com/docs/auth)
- [Expo Google Sign-In Plugin](https://docs.expo.dev/versions/latest/sdk/google-sign-in/)

## ✅ **Verification Checklist**

- [ ] Google Cloud Console project created
- [ ] Google Sign-In API enabled
- [ ] OAuth consent screen configured
- [ ] Web client ID created
- [ ] iOS client ID created
- [ ] Android client ID created with correct SHA-1
- [ ] google-services.json downloaded and placed
- [ ] GoogleService-Info.plist downloaded and placed
- [ ] Client IDs updated in code
- [ ] app.json configured
- [ ] Google Sign-In test passes

## 🚨 **Security Notes**

- Never commit OAuth client IDs to public repositories
- Use environment variables for production
- Regularly rotate OAuth client secrets
- Monitor OAuth usage in Google Cloud Console
- Set up proper OAuth consent screen for production use
