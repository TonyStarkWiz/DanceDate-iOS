# 🔥 Firestore Database Setup Guide

## 🎯 **What We've Set Up**

Your DanceDate app now has a **real Firestore database** with the following collections:

### **📚 Collections Created:**

1. **`users`** - User account information
2. **`profiles`** - User profile details (bio, location, dance styles)
3. **`events`** - Dance events and classes
4. **`matches`** - User matches and connections
5. **`chats`** - Chat conversations
6. **`messages`** - Individual chat messages
7. **`danceStyles`** - Available dance styles
8. **`locations`** - Dance locations and venues

## 🚀 **How to Use Firestore**

### **✅ User Management:**
```typescript
// Create a new user
await firestoreService.createUser({
  uid: 'user123',
  email: 'user@example.com',
  displayName: 'John Doe'
});

// Get user data
const user = await firestoreService.getUser('user123');

// Update user
await firestoreService.updateUser('user123', {
  displayName: 'John Smith'
});
```

### **✅ Profile Management:**
```typescript
// Create user profile
await firestoreService.createProfile('user123', {
  bio: 'Love dancing salsa!',
  location: 'New York',
  danceStyles: ['Salsa', 'Bachata'],
  photoURL: 'https://example.com/photo.jpg'
});

// Update profile
await firestoreService.updateProfile('user123', {
  bio: 'Professional salsa dancer'
});
```

### **✅ Event Management:**
```typescript
// Create a dance event
await firestoreService.createEvent({
  title: 'Salsa Night',
  location: 'Dance Studio NYC',
  date: '2024-01-15',
  danceStyles: ['Salsa'],
  organizer: 'user123',
  maxParticipants: 50
});

// Get events with filters
const events = await firestoreService.getEvents({
  location: 'New York',
  danceStyle: 'Salsa'
});
```

### **✅ Match Management:**
```typescript
// Create a match
await firestoreService.createMatch({
  participants: ['user123', 'user456'],
  danceStyle: 'Salsa',
  status: 'pending',
  createdAt: new Date().toISOString()
});

// Get user matches
const matches = await firestoreService.getUserMatches('user123');
```

### **✅ Chat & Messaging:**
```typescript
// Create a chat
const chat = await firestoreService.createChat({
  participants: ['user123', 'user456'],
  type: 'private',
  lastMessage: 'Hello!'
});

// Send a message
await firestoreService.sendMessage(chat.id, {
  sender: 'user123',
  text: 'Hello! Would you like to dance?',
  timestamp: new Date().toISOString()
});
```

## 🔧 **Database Rules (Firestore Security)**

You'll need to set up Firestore security rules in your Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Profiles are public but only owner can edit
    match /profiles/{profileId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == profileId;
    }
    
    // Events are public but only organizers can edit
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.uid == resource.data.organizer;
    }
    
    // Matches are private to participants
    match /matches/{matchId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Chats are private to participants
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in resource.data.participants;
    }
    
    // Messages are private to chat participants
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        request.auth.uid in get(/databases/$(database)/documents/chats/$(resource.data.chatId)).data.participants;
    }
  }
}
```

## 📱 **Testing Your Database**

1. **Navigate to**: `http://localhost:8084/test-auth`
2. **Create Account**: Sign up with email/password
3. **Update Profile**: Add bio and location
4. **View Database**: See all users stored in Firestore
5. **Check Console**: Look for Firestore operation logs

## 🌐 **Firebase Console Access**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `dancedatebackendios`
3. Navigate to **Firestore Database**
4. View your collections and documents in real-time

## 🔄 **Next Steps**

1. **Set up Firestore Rules** in Firebase Console
2. **Enable Authentication** methods you want to use
3. **Test CRUD operations** with the test screen
4. **Add more collections** as needed for your app
5. **Implement real-time listeners** for live updates

## ⚠️ **Important Notes**

- **Real-time sync**: Firestore automatically syncs data across devices
- **Offline support**: Data works offline and syncs when online
- **Scalability**: Firestore automatically scales with your app
- **Cost**: Free tier includes 50,000 reads, 20,000 writes per day

Your DanceDate app now has a **production-ready database** that will scale with your users! 🎉



