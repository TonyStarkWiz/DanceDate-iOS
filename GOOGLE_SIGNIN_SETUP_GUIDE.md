# Google Sign-In Setup Guide for DanceDate iOS

## Current Status
✅ **Temporary Fix Applied**: The app now runs without crashing
❌ **Google Sign-In**: Temporarily disabled (needs development build)

## Quick Fix Applied
The native module error has been resolved by temporarily disabling Google Sign-In imports. Your app should now run and display the welcome screen properly.

## To Enable Google Sign-In (Required Steps)

### Option 1: Development Build (Recommended)
1. **Install EAS CLI** (if not already installed):
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo**:
   ```bash
   eas login
   ```

3. **Build Development Client**:
   ```bash
   npx eas build --profile development --platform ios
   ```

4. **Install the Development Build**:
   - Download the `.ipa` file from the EAS build link
   - Install it on your iOS device/simulator

5. **Re-enable Google Sign-In**:
   - Uncomment the imports in `components/screens/WelcomeScreen.tsx`
   - Uncomment the imports in `services/googleSignIn.ts`
   - Remove the temporary mock implementations

### Option 2: Expo Auth Session (Alternative)
If you prefer to use Expo's managed workflow:

1. **Install expo-auth-session**:
   ```bash
   npx expo install expo-auth-session expo-crypto
   ```

2. **Replace Google Sign-In implementation** with expo-auth-session
3. **Configure OAuth client** in Google Cloud Console

## Current App Flow
1. **Entry Screen** (`app/entry.tsx`) - Simple welcome with "Get Started" button
2. **Welcome Screen** (`components/screens/WelcomeScreen.tsx`) - Main authentication screen
3. **Post-Login Welcome** (`components/screens/PostLoginWelcomeScreen.tsx`) - After successful authentication

## Testing the Current Fix
1. Run `npm start` to start the development server
2. Open the app on your device/simulator
3. You should see the welcome screen without the native module error
4. The "Continue with Google" button will show a message about needing a development build

## Next Steps
1. **Test the current app** to ensure it loads properly
2. **Choose your preferred Google Sign-In approach** (Development Build or Expo Auth Session)
3. **Follow the setup steps** for your chosen approach
4. **Re-enable Google Sign-In** functionality

## Files Modified
- `components/screens/WelcomeScreen.tsx` - Temporarily disabled Google Sign-In imports
- `services/googleSignIn.ts` - Created mock service to prevent crashes

## Files Ready for Re-enabling
- `components/screens/WelcomeScreen.tsx` - Has commented code ready to uncomment
- `services/googleSignIn.ts` - Has commented code ready to uncomment
- `contexts/AuthContext.tsx` - Already properly configured for Google Sign-In

## Support
If you encounter any issues:
1. Check the console logs for 🧪 emoji messages (debugging logs)
2. Ensure all dependencies are properly installed
3. Verify your Google Cloud Console configuration
4. Make sure you're using the correct client IDs for each platform
