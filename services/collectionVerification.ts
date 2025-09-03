// Collection Name Verification Script
import { COLLECTIONS, auth, db } from '@/config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export interface CollectionVerificationResult {
  collectionName: string;
  exists: boolean;
  documentCount: number;
  error?: string;
  sampleDocuments?: any[];
}

export async function verifyCollectionNames(): Promise<CollectionVerificationResult[]> {
  console.log('🧪 🔍 Starting Collection Name Verification...');
  
  const results: CollectionVerificationResult[] = [];
  
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('🧪 ⚠️ No authenticated user found');
      return results;
    }

    const userId = currentUser.uid;
    console.log('🧪 👤 Current user ID:', userId);

    // Get all collection names from your constants
    const expectedCollections = Object.values(COLLECTIONS);
    console.log('🧪 📋 Expected collections:', expectedCollections);

    // Test each collection
    for (const collectionName of expectedCollections) {
      console.log(`\n🧪 🔍 Testing collection: ${collectionName}`);
      
      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = await getDocs(collectionRef);
        
        const sampleDocs = snapshot.docs.slice(0, 3).map(doc => ({
          id: doc.id,
          data: doc.data()
        }));

        results.push({
          collectionName,
          exists: true,
          documentCount: snapshot.docs.length,
          sampleDocuments: sampleDocs
        });

        console.log(`✅ Collection "${collectionName}" exists with ${snapshot.docs.length} documents`);
        
        if (sampleDocs.length > 0) {
          console.log(`📄 Sample documents:`, sampleDocs);
        }

      } catch (error) {
        console.log(`❌ Collection "${collectionName}" error:`, error);
        results.push({
          collectionName,
          exists: false,
          documentCount: 0,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    // Test subcollections that your services use
    console.log('\n🧪 🔍 Testing subcollections...');
    
    // Test user's interested_events subcollection
    try {
      const userInterestsRef = collection(db, COLLECTIONS.USERS, userId, 'interested_events');
      const userInterestsSnapshot = await getDocs(userInterestsRef);
      console.log(`✅ User interested_events subcollection: ${userInterestsSnapshot.docs.length} documents`);
      
      if (userInterestsSnapshot.docs.length > 0) {
        console.log('📄 Sample user interests:', userInterestsSnapshot.docs.slice(0, 2).map(doc => ({
          id: doc.id,
          data: doc.data()
        })));
      }
    } catch (error) {
      console.log(`❌ User interested_events subcollection error:`, error);
    }

    // Test events and their interested_users subcollections
    try {
      const eventsRef = collection(db, COLLECTIONS.EVENTS);
      const eventsSnapshot = await getDocs(eventsRef);
      console.log(`✅ Events collection: ${eventsSnapshot.docs.length} events`);
      
      for (const eventDoc of eventsSnapshot.docs.slice(0, 3)) {
        try {
          const eventInterestsRef = collection(db, COLLECTIONS.EVENTS, eventDoc.id, 'interested_users');
          const eventInterestsSnapshot = await getDocs(eventInterestsRef);
          console.log(`  📅 Event "${eventDoc.id}" interested_users: ${eventInterestsSnapshot.docs.length} users`);
        } catch (error) {
          console.log(`  ❌ Event "${eventDoc.id}" interested_users error:`, error);
        }
      }
    } catch (error) {
      console.log(`❌ Events collection error:`, error);
    }

    // Test chat messages subcollection
    try {
      const chatsRef = collection(db, COLLECTIONS.CHATS);
      const chatsSnapshot = await getDocs(chatsRef);
      console.log(`✅ Chats collection: ${chatsSnapshot.docs.length} chats`);
      
      for (const chatDoc of chatsSnapshot.docs.slice(0, 2)) {
        try {
          const messagesRef = collection(db, COLLECTIONS.CHATS, chatDoc.id, COLLECTIONS.MESSAGES);
          const messagesSnapshot = await getDocs(messagesRef);
          console.log(`  💬 Chat "${chatDoc.id}" messages: ${messagesSnapshot.docs.length} messages`);
        } catch (error) {
          console.log(`  ❌ Chat "${chatDoc.id}" messages error:`, error);
        }
      }
    } catch (error) {
      console.log(`❌ Chats collection error:`, error);
    }

    // Test typing subcollection
    try {
      const chatsRef = collection(db, COLLECTIONS.CHATS);
      const chatsSnapshot = await getDocs(chatsRef);
      
      for (const chatDoc of chatsSnapshot.docs.slice(0, 2)) {
        try {
          const typingRef = collection(db, COLLECTIONS.CHATS, chatDoc.id, COLLECTIONS.TYPING);
          const typingSnapshot = await getDocs(typingRef);
          console.log(`  ⌨️ Chat "${chatDoc.id}" typing: ${typingSnapshot.docs.length} typing indicators`);
        } catch (error) {
          console.log(`  ❌ Chat "${chatDoc.id}" typing error:`, error);
        }
      }
    } catch (error) {
      console.log(`❌ Typing subcollection error:`, error);
    }

    // Test specific user matches
    console.log('\n🧪 🔍 Testing user-specific matches...');
    try {
      const matchesRef = collection(db, COLLECTIONS.MATCHES);
      const allMatchesSnapshot = await getDocs(matchesRef);
      
      const userMatches = allMatchesSnapshot.docs.filter(doc => {
        const data = doc.data();
        return data.userId1 === userId || data.userId2 === userId;
      });
      
      console.log(`✅ User matches: ${userMatches.length} out of ${allMatchesSnapshot.docs.length} total matches`);
      
      if (userMatches.length > 0) {
        console.log('📄 User matches:', userMatches.map(doc => ({
          id: doc.id,
          data: doc.data()
        })));
      }
    } catch (error) {
      console.log(`❌ User matches error:`, error);
    }

    console.log('\n🧪 ✅ Collection verification complete!');
    return results;

  } catch (error) {
    console.error('🧪 ❌ Error during collection verification:', error);
    return results;
  }
}

// Function to check if a specific collection path exists
export async function checkCollectionPath(collectionPath: string): Promise<boolean> {
  try {
    const collectionRef = collection(db, collectionPath);
    const snapshot = await getDocs(collectionRef);
    console.log(`✅ Collection path "${collectionPath}" exists with ${snapshot.docs.length} documents`);
    return true;
  } catch (error) {
    console.log(`❌ Collection path "${collectionPath}" does not exist or is not accessible:`, error);
    return false;
  }
}

// Function to test all possible collection name variations
export async function testCollectionNameVariations(): Promise<void> {
  console.log('🧪 🔍 Testing collection name variations...');
  
  const baseNames = [
    'users', 'events', 'matches', 'chats', 'messages', 'api_logs',
    'dance_videos', 'dance_events', 'dance_events_flat', 'interested_events', 
    'interested_users', 'promo_codes', 'user_credits', 'blocked', 'reports',
    'presence', 'premium_content', 'user_locations', 'cached_events', 'usage',
    'google_custom_search_usage', 'chat_message_usage', 'google_search_cache',
    'phase1_usage_tracking', 'dance_posts', 'booked_events', 'typing'
  ];
  
  const variations = [
    ...baseNames,
    ...baseNames.map(name => name.toUpperCase()),
    ...baseNames.map(name => name.charAt(0).toUpperCase() + name.slice(1)),
    // Test common variations
    'event_interests',
    'event_matches',
    'danceStyles',
    'locations',
    'profiles',
    'likes',
    'dislikes'
  ];

  for (const variation of variations) {
    await checkCollectionPath(variation);
  }
}

export { checkCollectionPath, testCollectionNameVariations, verifyCollectionNames };

