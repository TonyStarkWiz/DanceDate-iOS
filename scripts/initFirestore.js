// Initialize Firestore Database with Sample Data
// This script creates the initial collections and sample documents

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, addDoc } = require('firebase/firestore');

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXgvGAe8NAoJ2hU5OXbpVTtxJ0EBgL-zI",
  authDomain: "dancedatebackendios.firebaseapp.com",
  projectId: "dancedatebackendios",
  storageBucket: "dancedatebackendios.firebasestorage.app",
  messagingSenderId: "77009602137",
  appId: "1:77009602137:web:4bd7240cecdf696c05d348",
  measurementId: "G-G5SGTG446Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample data to create collections
const sampleData = {
  users: [
    {
      uid: 'sample-user-1',
      email: 'john@example.com',
      displayName: 'John Doe',
      username: 'johndoe',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      uid: 'sample-user-2',
      email: 'jane@example.com',
      displayName: 'Jane Smith',
      username: 'janesmith',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  
  profiles: [
    {
      uid: 'sample-user-1',
      bio: 'Love dancing salsa and bachata!',
      location: 'New York',
      danceStyles: ['Salsa', 'Bachata'],
      photoURL: null,
      preferences: { skillLevel: 'Intermediate' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      uid: 'sample-user-2',
      bio: 'Professional dance instructor',
      location: 'Los Angeles',
      danceStyles: ['Salsa', 'Bachata', 'Kizomba'],
      photoURL: null,
      preferences: { skillLevel: 'Advanced' },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  
  events: [
    {
      title: 'Salsa Night at Studio 54',
      location: 'New York',
      date: '2024-01-15',
      danceStyles: ['Salsa'],
      organizer: 'sample-user-1',
      maxParticipants: 50,
      description: 'Join us for an amazing salsa night!',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      title: 'Bachata Workshop',
      location: 'Los Angeles',
      date: '2024-01-20',
      danceStyles: ['Bachata'],
      organizer: 'sample-user-2',
      maxParticipants: 30,
      description: 'Learn bachata fundamentals',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  
  danceStyles: [
    { name: 'Salsa', description: 'Popular Latin dance', difficulty: 'Intermediate' },
    { name: 'Bachata', description: 'Romantic Dominican dance', difficulty: 'Beginner' },
    { name: 'Kizomba', description: 'Angolan dance', difficulty: 'Advanced' },
    { name: 'Merengue', description: 'Dominican folk dance', difficulty: 'Beginner' }
  ],
  
  locations: [
    { name: 'New York', country: 'USA', danceScene: 'Very Active' },
    { name: 'Los Angeles', country: 'USA', danceScene: 'Active' },
    { name: 'Miami', country: 'USA', danceScene: 'Very Active' },
    { name: 'London', country: 'UK', danceScene: 'Active' }
  ]
};

async function initializeFirestore() {
  try {
    console.log('🚀 Initializing Firestore Database...');
    
    // Create users collection
    console.log('📝 Creating users collection...');
    for (const user of sampleData.users) {
      await setDoc(doc(db, 'users', user.uid), user);
      console.log(`✅ Created user: ${user.displayName}`);
    }
    
    // Create profiles collection
    console.log('📝 Creating profiles collection...');
    for (const profile of sampleData.profiles) {
      await setDoc(doc(db, 'profiles', profile.uid), profile);
      console.log(`✅ Created profile for: ${profile.uid}`);
    }
    
    // Create events collection
    console.log('📝 Creating events collection...');
    for (const event of sampleData.events) {
      await addDoc(collection(db, 'events'), event);
      console.log(`✅ Created event: ${event.title}`);
    }
    
    // Create dance styles collection
    console.log('📝 Creating dance styles collection...');
    for (const style of sampleData.danceStyles) {
      await addDoc(collection(db, 'danceStyles'), style);
      console.log(`✅ Created dance style: ${style.name}`);
    }
    
    // Create locations collection
    console.log('📝 Creating locations collection...');
    for (const location of sampleData.locations) {
      await addDoc(collection(db, 'locations'), location);
      console.log(`✅ Created location: ${location.name}`);
    }
    
    console.log('🎉 Firestore Database initialized successfully!');
    console.log('📊 Collections created: users, profiles, events, danceStyles, locations');
    console.log('🌐 Check your Firebase Console to see the collections!');
    
  } catch (error) {
    console.error('❌ Error initializing Firestore:', error);
  }
}

// Run the initialization
initializeFirestore();



