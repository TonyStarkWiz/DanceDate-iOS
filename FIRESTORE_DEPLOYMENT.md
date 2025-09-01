# Firestore Security Rules Deployment

## Deploy Security Rules

To deploy the Firestore security rules to your Firebase project:

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Initialize Firebase in your project** (if not already done):
   ```bash
   firebase init firestore
   ```

4. **Deploy the security rules**:
   ```bash
   firebase deploy --only firestore:rules
   ```

## Rules Overview

The security rules implement:

- **User Authentication**: Only authenticated users can access data
- **Data Ownership**: Users can only access their own data
- **Event Access**: Users can read all events but only modify their own
- **Match Privacy**: Users can only access matches they're part of
- **Chat Security**: Users can only access chats they participate in
- **Public Data**: Dance styles and locations are publicly readable

## Testing Rules

You can test the rules locally:

```bash
firebase emulators:start --only firestore
```

Then use the Firebase Emulator UI to test your rules with different user scenarios.

## Rule Structure

- `users/{uid}` - User profiles (owner only)
- `events/{eventId}` - Dance events (read all, write own)
- `matches/{matchId}` - User matches (participants only)
- `chats/{chatId}` - Chat rooms (participants only)
- `messages/{messageId}` - Chat messages (chat participants only)
- `danceStyles/{doc}` - Dance styles (public read)
- `locations/{doc}` - Locations (public read)


