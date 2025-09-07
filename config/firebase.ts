// Real Firebase configuration with Firestore database
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';

// Your Firebase configuration for DanceLinkBackend project
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB1DaILxSQ2WGYQsUfJDrO4aeT8Xc0cPP0",
  authDomain: "dancelinkbackend.firebaseapp.com",
  projectId: "dancelinkbackend",
  storageBucket: "dancelinkbackend.firebasestorage.app",
  messagingSenderId: "915121530642",
  appId: "1:915121530642:web:8639d9440a4dd2afacf5cb",
  measurementId: "G-9VDJ2343DC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth
const auth = getAuth(app);

// Initialize Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('profile');
googleProvider.addScope('email');

// Initialize Firestore
const db = getFirestore(app);

// Helper function for safe document IDs
export const toDocId = (raw: string) => encodeURIComponent(raw);

// Firestore collections
export const COLLECTIONS = {
  USERS: 'users',                    // ✅ Used extensively
  PROFILES: 'profiles',              // ✅ Used for user profiles
  EVENTS: 'events',                  // ✅ Used for events
  MATCHES: 'matches',                // ✅ Used for user matches
  CHATS: 'chats',                   // ✅ Used for chat rooms
  MESSAGES: 'messages',              // ✅ Used as subcollection of chats
  API_LOGS: 'api_logs',             // ✅ Used as 'api_call_logs'
  DANCE_VIDEOS: 'dance_videos',           // ✅ Used for video content
  DANCE_EVENTS: 'dance_events',           // ✅ Used for events
  DANCE_EVENTS_FLAT: 'dance_events_flat', // ✅ Used for flattened events
  INTERESTED_EVENTS: 'interested_events', // ✅ Used for user event interests
  INTERESTED_USERS: 'interested_users',   // ✅ Used for event user interests
  EVENT_INTERESTS: 'event_interests',     // ✅ Used for user event interests (new format)
  PROMO_CODES: 'promo_codes',             // ✅ Used for promotional codes
  USER_CREDITS: 'user_credits',          // ✅ Used for user credits
  BLOCKED: 'blocked',                    // ✅ Used for blocked users
  REPORTS: 'reports',                    // ✅ Used for user reports
  PRESENCE: 'presence',                  // ✅ Used for user presence
  PREMIUM_CONTENT: 'premium_content',     // ✅ Used for premium features
  USER_LOCATIONS: 'user_locations',       // ✅ Used for user location data
  CACHED_EVENTS: 'cached_events',         // ✅ Used for event caching
  USAGE: 'usage',                        // ✅ Used for usage tracking
  GOOGLE_CUSTOM_SEARCH_USAGE: 'google_custom_search_usage', // ✅ Used for search tracking
  CHAT_MESSAGE_USAGE: 'chat_message_usage', // ✅ Used for chat usage
  GOOGLE_SEARCH_CACHE: 'google_search_cache', // ✅ Used for search caching
  PHASE1_USAGE_TRACKING: 'phase1_usage_tracking', // ✅ Used for usage tracking
  DANCE_POSTS: 'dance_posts',            // ✅ Used for feed posts
  BOOKED_EVENTS: 'booked_events',        // ✅ Used for booked events
  TYPING: 'typing',                      // ✅ Used as subcollection of chats
} as const;

// Firestore service functions
export const firestoreService = {
  // User management
  async createUser(userData: any) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userData.uid);
      await setDoc(userRef, {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('🧪 User created in Firestore:', userData.uid);
      return userRef;
    } catch (error) {
      console.error('🧪 Error creating user in Firestore:', error);
      throw error;
    }
  },

  async getUser(uid: string) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        return { id: userSnap.id, ...userSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user from Firestore:', error);
      throw error;
    }
  },

  async updateUser(uid: string, updates: any) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('🧪 User updated in Firestore:', uid);
    } catch (error) {
      console.error('🧪 Error updating user in Firestore:', error);
      throw error;
    }
  },

  // Profile management
  async createProfile(uid: string, profileData: any) {
    try {
      const profileRef = doc(db, COLLECTIONS.PROFILES, uid);
      await setDoc(profileRef, {
        uid,
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('🧪 Profile created in Firestore:', uid);
      return profileRef;
    } catch (error) {
      console.error('🧪 Error creating profile in Firestore:', error);
      throw error;
    }
  },

  async getProfile(uid: string) {
    try {
      const profileRef = doc(db, COLLECTIONS.PROFILES, uid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists()) {
        return { id: profileSnap.id, ...profileSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting profile from Firestore:', error);
      throw error;
    }
  },

  async updateProfile(uid: string, updates: any) {
    try {
      const profileRef = doc(db, COLLECTIONS.PROFILES, uid);
      await updateDoc(profileRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      console.log('🧪 Profile updated in Firestore:', uid);
    } catch (error) {
      console.error('🧪 Error updating profile in Firestore:', error);
      throw error;
    }
  },

  // Event management
  async createEvent(eventData: any) {
    try {
      const eventRef = await addDoc(collection(db, COLLECTIONS.EVENTS), {
        ...eventData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('🧪 Event created in Firestore:', eventRef.id);
      return eventRef;
    } catch (error) {
      console.error('🧪 Error creating event in Firestore:', error);
      throw error;
    }
  },

  async getEvents(filters?: any) {
    try {
      let eventsQuery: any = collection(db, COLLECTIONS.EVENTS);
      
      if (filters) {
        // Apply filters if provided
        if (filters.location) {
          eventsQuery = query(eventsQuery, where('location', '==', filters.location));
        }
        if (filters.danceStyle) {
          eventsQuery = query(eventsQuery, where('danceStyles', 'array-contains', filters.danceStyle));
        }
      }
      
      const querySnapshot = await getDocs(eventsQuery);
      const events: any[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        events.push({ id: doc.id, ...(data as any) });
      });
      
      return events;
    } catch (error) {
      console.error('Error getting events from Firestore:', error);
      throw error;
    }
  },

  // Match management
  async createMatch(matchData: any) {
    try {
      const matchRef = await addDoc(collection(db, COLLECTIONS.MATCHES), {
        ...matchData,
        participants: matchData.participants || [matchData.userId1, matchData.userId2],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('🧪 Match created in Firestore:', matchRef.id);
      return matchRef;
    } catch (error) {
      console.error('🧪 Error creating match in Firestore:', error);
      throw error;
    }
  },

  async getUserMatches(uid: string) {
    try {
      const matchesQuery = query(
        collection(db, COLLECTIONS.MATCHES),
        where('participants', 'array-contains', uid)
      );
      const querySnapshot = await getDocs(matchesQuery);
      const matches: any[] = [];
      querySnapshot.forEach((doc) => {
        matches.push({ id: doc.id, ...doc.data() });
      });
      return matches;
    } catch (error) {
      console.error('Error getting user matches from Firestore:', error);
      throw error;
    }
  },

  // Chat management
  async createChat(chatData: any) {
    try {
      const chatRef = await addDoc(collection(db, COLLECTIONS.CHATS), {
        ...chatData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('🧪 Chat created in Firestore:', chatRef.id);
      return chatRef;
    } catch (error) {
      console.error('🧪 Error creating chat in Firestore:', error);
      throw error;
    }
  },

  async sendMessage(chatId: string, messageData: any) {
    try {
      const msgRef = await addDoc(
        collection(db, COLLECTIONS.CHATS, chatId, 'messages'),
        {
          ...messageData,
          timestamp: serverTimestamp(),
          read: false,
        }
      );
      
      // Update chat metadata
      await updateDoc(doc(db, COLLECTIONS.CHATS, chatId), {
        lastMessage: messageData.text ?? '',
        lastMessageTime: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('🧪 Message sent to Firestore:', msgRef.id);
      return msgRef;
    } catch (error) {
      console.error('🧪 Error sending message to Firestore:', error);
      throw error;
    }
  },

  // Utility functions
  async getAllUsers() {
    try {
      const usersQuery = collection(db, COLLECTIONS.USERS);
      const querySnapshot = await getDocs(usersQuery);
      const users: any[] = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      return users;
    } catch (error) {
      console.error('Error getting all users from Firestore:', error);
      throw error;
    }
  },

  async deleteDocument(collectionName: string, docId: string) {
    try {
      await deleteDoc(doc(db, collectionName, docId));
      console.log(`🧪 Document deleted from ${collectionName}:`, docId);
    } catch (error) {
      console.error(`🧪 Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  },

  // Interest state helper
  async isInterested(uid: string, eventId: string) {
    try {
      const ref = doc(db, COLLECTIONS.USERS, uid, 'interested_events', toDocId(String(eventId)));
      return (await getDoc(ref)).exists();
    } catch (error) {
      console.error('🧪 Error checking interest state:', error);
      return false;
    }
  },

  // Helper to set interest state
  async setInterest(uid: string, eventId: string, interested: boolean) {
    try {
      const ref = doc(db, COLLECTIONS.USERS, uid, 'interested_events', toDocId(String(eventId)));
      if (interested) {
        await setDoc(ref, {
          eventId: String(eventId),
          interested: true,
          timestamp: serverTimestamp()
        });
      } else {
        await deleteDoc(ref);
      }
      console.log('🧪 Interest state updated:', { uid, eventId, interested });
      return true;
    } catch (error) {
      console.error('🧪 Error setting interest state:', error);
      return false;
    }
  },

  // Helper to get user's interested events
  async getUserInterestedEvents(uid: string) {
    try {
      const interestedQuery = collection(db, COLLECTIONS.USERS, uid, 'interested_events');
      const querySnapshot = await getDocs(interestedQuery);
      const events: any[] = [];
      querySnapshot.forEach((doc) => {
        events.push({ id: doc.id, ...doc.data() });
      });
      return events;
    } catch (error) {
      console.error('🧪 Error getting user interested events:', error);
      return [];
    }
  }
};

export { auth, db, googleProvider };
export default auth;
