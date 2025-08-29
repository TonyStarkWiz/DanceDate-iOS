# 🚀 Google OAuth Quick Setup for DanceDate iOS

## 📱 **Your App Configuration**
- **Bundle ID**: `com.antho.dancedate`
- **Package Name**: `com.antho.dancedate`
- **Firebase Project**: `DanceLinkBackend`

## ⚡ **Quick Setup Steps (15 minutes)**

### **Step 1: Google Cloud Console (5 minutes)**

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Select your project**: `DanceLinkBackend`
3. **Enable APIs**: Go to "APIs & Services" > "Library"
   - Search for "Google Sign-In API" and enable it
   - Search for "Google+ API" and enable it

### **Step 2: Create OAuth Client IDs (5 minutes)**

1. **Go to "APIs & Services" > "Credentials"**
2. **Click "+ CREATE CREDENTIALS" > "OAuth client ID"**
3. **Configure OAuth consent screen** (if prompted):
   - App name: `DanceDate`
   - User support email: `anthonyespinosa33891@gmail.com`
   - Developer contact: `anthonyespinosa33891@gmail.com`

4. **Create these 3 client IDs:**

#### **Web Client ID**
- Application type: `Web application`
- Name: `DanceDate Web`
- Authorized origins: `http://localhost:8081`
- Authorized redirects: `http://localhost:8081`

#### **iOS Client ID**
- Application type: `iOS`
- Name: `DanceDate iOS`
- Bundle ID: `com.antho.dancedate`

#### **Android Client ID**
- Application type: `Android`
- Name: `DanceDate Android`
- Package name: `com.antho.dancedate`
- SHA-1: `(Leave blank for now - we'll get this next)`

### **Step 3: Get Android SHA-1 (3 minutes)**

**For Development (Debug):**

Since you don't have a debug keystore yet, you have two options:

#### **Option A: Generate Debug Keystore (Recommended)**
```bash
# Create the .android directory
mkdir "%USERPROFILE%\.android"

# Generate debug keystore
keytool -genkey -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -keyalg RSA -keysize 2048 -validity 10000 -storepass android -keypass android -dname "CN=Android Debug,O=Android,C=US"

# Get SHA-1 fingerprint
keytool -list -v -keystore "%USERPROFILE%\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```

#### **Option B: Use EAS Build (Alternative)**
```bash
# Build a development APK to generate keystore
npx eas build --platform android --profile development

# Then get the SHA-1 from the generated keystore
```

**Copy the SHA-1 fingerprint** and update your Android OAuth client ID.

### **Step 4: Download Firebase Config Files (2 minutes)**

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Select project**: `DanceLinkBackend`
3. **Project Settings** > **General** > **Your apps**

#### **For Android:**
- Click on Android app (create if needed)
- Download `google-services.json`
- Place in project root

#### **For iOS:**
- Click on iOS app (create if needed)
- Download `GoogleService-Info.plist`
- Place in project root

## 🔧 **Update Your Code**

### **Update services/googleSignIn.ts**
Replace the placeholder client IDs:

```typescript
private clientIds = [
  'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com',      // From Step 2
  'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com',      // From Step 2
  'YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com',  // From Step 2
];
```

## 🧪 **Test Google Sign-In**

1. **Run your app**: `npm run start`
2. **Navigate to Test Auth Screen**
3. **Click "Test Google Sign-In"**
4. **You should see Google Sign-In popup!**

## 🔍 **Troubleshooting**

### **"Developer Error" or "Invalid Client"**
- ✅ Verify client IDs are correct
- ✅ Ensure OAuth consent screen is configured
- ✅ Check that APIs are enabled

### **"Network Error"**
- ✅ Check internet connection
- ✅ Verify Firebase configuration
- ✅ Ensure Google Sign-In API is enabled

### **"Package Name Mismatch"**
- ✅ Verify bundle ID matches OAuth client ID
- ✅ Check that config files are in correct location

### **"SHA-1 Mismatch"**
- ✅ Regenerate SHA-1 fingerprint
- ✅ Update OAuth client ID with new fingerprint
- ✅ Clear app cache and rebuild

## 📋 **Checklist**

- [ ] Google Sign-In API enabled
- [ ] OAuth consent screen configured
- [ ] Web client ID created
- [ ] iOS client ID created
- [ ] Android client ID created with SHA-1
- [ ] google-services.json downloaded
- [ ] GoogleService-Info.plist downloaded
- [ ] Client IDs updated in code
- [ ] Google Sign-In test passes

## 🎯 **Expected Result**

After completing these steps, your Google Sign-In should work perfectly, matching the functionality of your Android app!

**Need help?** Check the detailed guide in `GOOGLE_OAUTH_SETUP.md`

## 🚨 **Important Notes**

- **Never commit OAuth client IDs** to public repositories
- **Use environment variables** for production
- **Regularly rotate** OAuth client secrets
- **Monitor usage** in Google Cloud Console
