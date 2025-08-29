// Real Firebase configuration with Firestore database
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, query, setDoc, updateDoc, where } from 'firebase/firestore';

// Your Firebase configuration for DanceLinkBackend project
const firebaseConfig = {
  apiKey: "AIzaSyCDNh4HMY9YzDzqQDTvz_3RePe2-XSjabo",
  authDomain: "dancelinkbackend.firebaseapp.com",
  projectId: "dancelinkbackend",
  storageBucket: "dancelinkbackend.appspot.com",
  messagingSenderId: "915121530642",
  appId: "1:915121530642:android:249f990e5a8a67b1acf5cb",
  measurementId: "G-XXXXXXXXXX"
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

// Firestore collections
export const COLLECTIONS = {
  USERS: 'users',
  PROFILES: 'profiles',
  EVENTS: 'events',
  MATCHES: 'matches',
  CHATS: 'chats',
  MESSAGES: 'messages',
  DANCE_STYLES: 'danceStyles',
  LOCATIONS: 'locations'
} as const;

// Firestore service functions
export const firestoreService = {
  // User management
  async createUser(userData: any) {
    try {
      const userRef = doc(db, COLLECTIONS.USERS, userData.uid);
      await setDoc(userRef, {
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('User created in Firestore:', userData.uid);
      return userRef;
    } catch (error) {
      console.error('Error creating user in Firestore:', error);
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
        updatedAt: new Date().toISOString()
      });
      console.log('User updated in Firestore:', uid);
    } catch (error) {
      console.error('Error updating user in Firestore:', error);
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('Profile created in Firestore:', uid);
      return profileRef;
    } catch (error) {
      console.error('Error creating profile in Firestore:', error);
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
        updatedAt: new Date().toISOString()
      });
      console.log('Profile updated in Firestore:', uid);
    } catch (error) {
      console.error('Error updating profile in Firestore:', error);
      throw error;
    }
  },

  // Event management
  async createEvent(eventData: any) {
    try {
      const eventRef = await addDoc(collection(db, COLLECTIONS.EVENTS), {
        ...eventData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('Event created in Firestore:', eventRef.id);
      return eventRef;
    } catch (error) {
      console.error('Error creating event in Firestore:', error);
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
        events.push({ id: doc.id, ...data });
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('Match created in Firestore:', matchRef.id);
      return matchRef;
    } catch (error) {
      console.error('Error creating match in Firestore:', error);
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
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('Chat created in Firestore:', chatRef.id);
      return chatRef;
    } catch (error) {
      console.error('Error creating chat in Firestore:', error);
      throw error;
    }
  },

  async sendMessage(chatId: string, messageData: any) {
    try {
      const messageRef = await addDoc(collection(db, COLLECTIONS.MESSAGES), {
        chatId,
        ...messageData,
        createdAt: new Date().toISOString()
      });
      console.log('Message sent to Firestore:', messageRef.id);
      return messageRef;
    } catch (error) {
      console.error('Error sending message to Firestore:', error);
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
      console.log(`Document deleted from ${collectionName}:`, docId);
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error);
      throw error;
    }
  }
};

export { auth, db, googleProvider };
export default auth;
