#!/usr/bin/env node

/**
 * Script to get SHA-1 fingerprint for Android builds
 * This helps with Google OAuth setup
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔐 Getting SHA-1 fingerprint for Google OAuth setup...\n');

try {
  // Check if we're in the right directory
  if (!fs.existsSync('app.json')) {
    console.error('❌ Please run this script from your project root directory');
    process.exit(1);
  }

  // Read app.json to get package name
  const appJson = JSON.parse(fs.readFileSync('app.json', 'utf8'));
  const packageName = appJson.expo?.android?.package;

  if (!packageName) {
    console.error('❌ No package name found in app.json');
    process.exit(1);
  }

  console.log(`📱 Package name: ${packageName}`);
  console.log(`🔑 Bundle ID: ${appJson.expo?.ios?.bundleIdentifier || 'Not set'}\n`);

  console.log('📋 Next steps for Google OAuth setup:\n');

  console.log('1. Go to [Google Cloud Console](https://console.cloud.google.com/)');
  console.log('2. Select your Firebase project');
  console.log('3. Go to APIs & Services > Credentials');
  console.log('4. Create OAuth 2.0 Client IDs:\n');

  console.log('   Web Client ID:');
  console.log('   - Type: Web application');
  console.log('   - Origins: http://localhost:8081');
  console.log('   - Redirects: http://localhost:8081\n');

  console.log('   iOS Client ID:');
  console.log(`   - Type: iOS`);
  console.log(`   - Bundle ID: ${appJson.expo?.ios?.bundleIdentifier || 'com.antho.dancedate'}\n`);

  console.log('   Android Client ID:');
  console.log(`   - Type: Android`);
  console.log(`   - Package name: ${packageName}`);
  console.log('   - SHA-1: (Get this from your keystore)\n');

  console.log('5. Get SHA-1 fingerprint:');
  console.log('   - For development: Use debug keystore SHA-1');
  console.log('   - For production: Use release keystore SHA-1\n');

  console.log('6. Download configuration files from Firebase Console:');
  console.log('   - google-services.json (Android)');
  console.log('   - GoogleService-Info.plist (iOS)\n');

  console.log('7. Update services/googleSignIn.ts with your client IDs\n');

  console.log('💡 Tip: You can get the SHA-1 from your keystore using:');
  console.log('   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android');

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
