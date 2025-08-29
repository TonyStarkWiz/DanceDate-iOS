# Firebase Setup Guide for DanceDate iOS

## 🚀 **Step 1: Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `dancedate-ios` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 🔑 **Step 2: Get Firebase Configuration**

1. In your Firebase project, click the gear icon ⚙️ next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to add a web app
5. Enter app nickname: `DanceDate Web`
6. Click "Register app"
7. Copy the `firebaseConfig` object

## ✅ **Step 3: Firebase Config Complete!**

Your Firebase configuration has been updated with your project details:
- **Project ID**: `dancedatebackendios`
- **Auth Domain**: `dancedatebackendios.firebaseapp.com`
- **Analytics**: Enabled with measurement ID `G-G5SGTG446Q`

## 🔐 **Step 4: Enable Authentication**

> **Note**: You do NOT need Firebase Hosting for your iOS app. Hosting is only for web apps. Your React Native app communicates directly with Firebase services.

1. In Firebase Console, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

## 📋 **Step 5: Test Your Setup**

1. Start your Expo server: `npx expo start --web --port 8082`
2. Navigate to `/create_account` to test account creation
3. Navigate to `/login` to test sign in
4. Check Firebase Console > Authentication > Users to see created accounts

## 🎯 **Current Features Implemented**

✅ **Email/Password Authentication**
- User registration with email, username, password
- User login with email and password
- Form validation and error handling
- Loading states during authentication
- Automatic navigation after successful auth

✅ **Authentication Context**
- Global auth state management
- User persistence with AsyncStorage
- Protected routes and loading states

## 🔮 **Next Steps (Optional)**

### **Google Sign-In**
To enable Google Sign-In, install:
```bash
npm install @react-native-google-signin/google-signin
```

### **Firestore Integration**
To store user profiles and data:
```bash
npm install firebase/firestore
```

### **Password Reset**
To add "Forgot Password" functionality:
```bash
# Already included in Firebase Auth
# Just need to implement the UI and call sendPasswordResetEmail
```

## 🚨 **Important Notes**

1. **Never commit your Firebase config** to public repositories
2. **Use environment variables** for production apps
3. **Enable proper security rules** in Firebase Console
4. **Test on both web and mobile** platforms

## 🆘 **Troubleshooting**

### **"Firebase not initialized" error**
- Check that your `firebaseConfig` values are correct
- Ensure Firebase project is created and enabled

### **"Permission denied" error**
- Check Firebase Authentication settings
- Ensure Email/Password provider is enabled

### **"Module not found" error**
- Run `npm install` to ensure all dependencies are installed
- Check import paths in your components

## 📞 **Need Help?**

- [Firebase Documentation](https://firebase.google.com/docs)
- [React Native Firebase](https://rnfirebase.io/)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)

---

**Your Firebase Authentication is now ready! 🎉**

Test it by creating an account and signing in. The app will automatically navigate to the main tabs after successful authentication.

## 🔐 **Step 6: Enable Google Sign-In**

To make the "Continue with Google" button work, you need to enable Google Sign-In in your Firebase Console:

### **✅ Enable Google Sign-In:**

1. **Go to Firebase Console**: [https://console.firebase.google.com/project/dancedatebackendios/authentication/providers](https://console.firebase.google.com/project/dancedatebackendios/authentication/providers)

2. **Click on "Google"** in the Sign-in providers list

3. **Enable Google Sign-In**:
   - Toggle the "Enable" switch to ON
   - **Project support email**: Use your email or project email
   - **Web SDK configuration**: This will be automatically configured

4. **Save** the configuration

### **✅ What We've Implemented:**

- **Google Sign-In Package**: Installed `@react-native-google-signin/google-signin`
- **Firebase Configuration**: Added `GoogleAuthProvider` with profile and email scopes
- **Auth Context**: Updated `signInWithGoogle` function to use Firebase's Google Sign-In
- **Web Support**: Uses popup for web, redirect for mobile
- **Error Handling**: Proper error messages for popup blocked, cancelled, etc.

### **✅ Test Google Sign-In:**

1. **Navigate to**: `http://localhost:8082/welcome`
2. **Click**: "Continue with Google" button
3. **Expected**: Google Sign-In popup/redirect
4. **After Sign-In**: User will be created in Firestore automatically

**Your Google Sign-In is now fully implemented!** 🎉
