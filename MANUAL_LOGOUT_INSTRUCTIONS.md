# 🔥 Manual Logout Instructions

Since the logout buttons aren't working due to Firebase configuration issues, here's how to manually log out:

## Method 1: Browser Console (Most Effective)

1. **Open Browser Console:**
   - Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Go to the "Console" tab

2. **Run These Commands:**
   ```javascript
   // Clear all storage
   localStorage.clear();
   sessionStorage.clear();
   
   // Clear all cookies
   document.cookie.split(";").forEach(function(c) { 
     document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
   });
   
   // Force reload to welcome page
   window.location.href = '/welcome';
   ```

3. **Press Enter** - This should immediately log you out and redirect to the welcome screen.

## Method 2: Browser DevTools

1. **Open DevTools** (`F12`)
2. **Go to Application tab**
3. **Storage section:**
   - Click "Clear storage" button
   - Check all boxes
   - Click "Clear site data"
4. **Refresh the page** - You should be logged out

## Method 3: Hard Refresh

1. **Hard refresh the page:**
   - `Ctrl+Shift+R` (Windows/Linux)
   - `Cmd+Shift+R` (Mac)
2. **Navigate to:** `http://localhost:8082/welcome` (note the port change)

## Method 4: Incognito/Private Mode

1. **Open a new incognito/private window**
2. **Navigate to:** `http://localhost:8082/welcome`
3. **This will start fresh without any stored auth data**

## Expected Result

After any of these methods:
- ✅ You should be redirected to the welcome screen
- ✅ No user should be logged in
- ✅ You should be able to sign in as a different user
- ✅ The profile page should show "Not logged in" or redirect to login

## If Still Not Working

The issue might be that Firebase Auth is persisting in memory. Try:

1. **Close the browser completely**
2. **Reopen and go to:** `http://localhost:8082/welcome`
3. **Or restart the development server:**
   ```bash
   # Stop the current server (Ctrl+C)
   # Then restart
   npx expo start --clear --port 8082
   ```

## Debug Information

To check what's currently stored, run this in the console:
```javascript
console.log('localStorage:', Object.keys(localStorage));
console.log('sessionStorage:', Object.keys(sessionStorage));
console.log('cookies:', document.cookie);
```

This will show you what authentication data is currently stored in your browser.


