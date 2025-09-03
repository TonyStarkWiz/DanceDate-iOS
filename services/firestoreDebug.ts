// Firestore Debug Script
import { COLLECTIONS, auth, db } from '@/config/firebase';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';

export async function debugFirestoreCollections() {
  console.log('🧪 🔍 Starting Firestore Debug...');
  
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.log('🧪 ⚠️ No authenticated user found');
      return;
    }

    const userId = currentUser.uid;
    console.log('🧪 👤 Current user ID:', userId);

    // 1. Check if user document exists
    console.log('\n🧪 📋 1. Checking user document...');
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));
    if (userDoc.exists()) {
      console.log('✅ User document exists:', userDoc.data());
    } else {
      console.log('❌ User document does not exist');
    }

    // 2. Check user's interested events
    console.log('\n🧪 📋 2. Checking user\'s interested events...');
    const userInterestsSnapshot = await getDocs(collection(db, COLLECTIONS.USERS, userId, 'interested_events'));
    console.log(`📊 Found ${userInterestsSnapshot.docs.length} interested events:`);
    userInterestsSnapshot.docs.forEach((doc, index) => {
      console.log(`  ${index + 1}. Event ID: ${doc.id}`, doc.data());
    });

    // 3. Check all events and their interested users
    console.log('\n🧪 📋 3. Checking all events and interested users...');
    const eventsSnapshot = await getDocs(collection(db, COLLECTIONS.EVENTS));
    console.log(`📊 Found ${eventsSnapshot.docs.length} events:`);
    
    for (const eventDoc of eventsSnapshot.docs) {
      const eventId = eventDoc.id;
      console.log(`\n  📅 Event: ${eventId}`, eventDoc.data());
      
      // Check interested users for this event
      const eventInterestsSnapshot = await getDocs(collection(db, COLLECTIONS.EVENTS, eventId, 'interested_users'));
      console.log(`    👥 ${eventInterestsSnapshot.docs.length} users interested:`);
      eventInterestsSnapshot.docs.forEach((userDoc, index) => {
        console.log(`      ${index + 1}. User ID: ${userDoc.id}`, userDoc.data());
      });
    }

    // 4. Check matches collection
    console.log('\n🧪 📋 4. Checking matches collection...');
    const matchesSnapshot = await getDocs(collection(db, COLLECTIONS.MATCHES));
    console.log(`📊 Found ${matchesSnapshot.docs.length} matches:`);
    matchesSnapshot.docs.forEach((doc, index) => {
      console.log(`  ${index + 1}. Match ID: ${doc.id}`, doc.data());
    });

    // 5. Check user's matches specifically
    console.log('\n🧪 📋 5. Checking user\'s matches...');
    const userMatchesQuery = query(
      collection(db, COLLECTIONS.MATCHES),
      where('userId1', '==', userId)
    );
    const userMatches1Snapshot = await getDocs(userMatchesQuery);
    
    const userMatchesQuery2 = query(
      collection(db, COLLECTIONS.MATCHES),
      where('userId2', '==', userId)
    );
    const userMatches2Snapshot = await getDocs(userMatchesQuery2);
    
    console.log(`📊 Found ${userMatches1Snapshot.docs.length + userMatches2Snapshot.docs.length} matches for user:`);
    
    [...userMatches1Snapshot.docs, ...userMatches2Snapshot.docs].forEach((doc, index) => {
      console.log(`  ${index + 1}. Match ID: ${doc.id}`, doc.data());
    });

    // 6. Check chats collection
    console.log('\n🧪 📋 6. Checking chats collection...');
    const chatsSnapshot = await getDocs(collection(db, COLLECTIONS.CHATS));
    console.log(`📊 Found ${chatsSnapshot.docs.length} chats:`);
    chatsSnapshot.docs.forEach((doc, index) => {
      console.log(`  ${index + 1}. Chat ID: ${doc.id}`, doc.data());
    });

    // 7. Check event_interests collection
    console.log('\n🧪 📋 7. Checking event_interests collection...');
    const eventInterestsSnapshot = await getDocs(collection(db, COLLECTIONS.EVENT_INTERESTS));
    console.log(`📊 Found ${eventInterestsSnapshot.docs.length} event interests:`);
    eventInterestsSnapshot.docs.forEach((doc, index) => {
      console.log(`  ${index + 1}. Interest ID: ${doc.id}`, doc.data());
    });

    // 8. Check event_matches collection
    console.log('\n🧪 📋 8. Checking event_matches collection...');
    const eventMatchesSnapshot = await getDocs(collection(db, COLLECTIONS.EVENT_MATCHES));
    console.log(`📊 Found ${eventMatchesSnapshot.docs.length} event matches:`);
    eventMatchesSnapshot.docs.forEach((doc, index) => {
      console.log(`  ${index + 1}. Event Match ID: ${doc.id}`, doc.data());
    });

    console.log('\n🧪 ✅ Firestore debug complete!');

  } catch (error) {
    console.error('🧪 ❌ Error during Firestore debug:', error);
  }
}

// Export for use in other files
export { debugFirestoreCollections };
