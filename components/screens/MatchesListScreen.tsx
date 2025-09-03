import { BackButton } from '@/components/ui/BackButton';
import { COLLECTIONS, db } from '@/config/firebase';
import { useAuth } from '@/contexts/AuthContext';
import { bilateralMatchingService } from '@/services/bilateralMatchingService';
import { matchingService } from '@/services/matchingService';
import { Match } from '@/types/matching';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { collection, doc, getDocs, query, setDoc, where, writeBatch } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export const MatchesListScreen: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [authCheckLogs, setAuthCheckLogs] = useState<string[]>([]);
  const [showAuthCheck, setShowAuthCheck] = useState(false);

  useEffect(() => {
    console.log('🧪 MatchesListScreen: useEffect triggered');
    console.log('🧪 MatchesListScreen: User object:', user);
    console.log('🧪 MatchesListScreen: User ID:', user?.id);
    console.log('🧪 MatchesListScreen: User ID type:', typeof user?.id);
    
    if (user?.id) {
      console.log('🧪 MatchesListScreen: User ID exists, calling loadMatches');
      loadMatches();
    } else {
      console.log('🧪 MatchesListScreen: No user ID available');
    }
  }, [user?.id]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      console.log('🧪 MatchesListScreen: Loading matches for user:', user!.id);
      
      // 🎯 APPROACH 1: Debug the bilateral system first
      console.log('🧪 MatchesListScreen: Debugging bilateral matching system');
      
      // Get user's interests from bilateral system
      const userInterests = await bilateralMatchingService.getUserInterests(user!.id);
      console.log('🧪 MatchesListScreen: User interests found:', userInterests.length);
      console.log('🧪 MatchesListScreen: User interests details:', userInterests);
      
      if (userInterests.length === 0) {
        console.log('🧪 MatchesListScreen: No user interests found, checking old matches system');
        // Fallback to old system if no interests
        const oldMatches = await matchingService.getUserMatches(user!.id);
        console.log('🧪 MatchesListScreen: Old system matches:', oldMatches.length);
        setMatches(oldMatches);
        return;
      }
      
      const realMatches: Match[] = [];
      
      // Check each interest for bilateral matches
      for (const interest of userInterests) {
        console.log('🧪 MatchesListScreen: Checking interest:', interest.eventId, interest.title);
        
        // Get all users interested in this event
        const eventInterestedUsers = await bilateralMatchingService.getEventInterestedUsers(interest.eventId);
        console.log('🧪 MatchesListScreen: Event interested users:', eventInterestedUsers.length);
        
        // Find bilateral matches (users who are also interested in this event)
        for (const interestedUser of eventInterestedUsers) {
          if (interestedUser.userId !== user!.id) {
            console.log('🧪 MatchesListScreen: Checking user:', interestedUser.userId, interestedUser.name);
            
            // Check if this user is also interested in the same event
            const mutualInterests = await bilateralMatchingService.getUserInterests(interestedUser.userId);
            const hasBilateralInterest = mutualInterests.some(mi => mi.eventId === interest.eventId);
            
            console.log('🧪 MatchesListScreen: Has bilateral interest:', hasBilateralInterest);
            
            if (hasBilateralInterest) {
              console.log('🧪 MatchesListScreen: Found bilateral match with:', interestedUser.name);
              
              // Create a real match object
              const realMatch: Match = {
                id: `bilateral_${user!.id}_${interestedUser.userId}_${interest.eventId}`,
                userId1: user!.id,
                userId2: interestedUser.userId,
                eventId: interest.eventId,
                matchStrength: 95, // High strength for bilateral matches
                status: 'accepted' as any,
                createdAt: new Date(),
                lastInteraction: new Date(),
                isMutual: true,
                partnerName: interestedUser.name,
                partnerLocation: 'Event-based match',
                partnerBio: `Matched through mutual interest in "${interest.title}"`,
                matchType: 'bilateral',
                partnerInterests: [interest.title]
              };
              
              realMatches.push(realMatch);
            }
          }
        }
      }
      
      console.log('🧪 MatchesListScreen: Found', realMatches.length, 'real bilateral matches');
      
      if (realMatches.length === 0) {
        console.log('🧪 MatchesListScreen: No bilateral matches, falling back to old system');
        const oldMatches = await matchingService.getUserMatches(user!.id);
        setMatches(oldMatches);
      } else {
        setMatches(realMatches);
      }
      
    } catch (error) {
      console.error('🧪 MatchesListScreen: Error loading matches:', error);
      // Fallback to old system on error
      try {
        const oldMatches = await matchingService.getUserMatches(user!.id);
        setMatches(oldMatches);
      } catch (fallbackError) {
        console.error('🧪 MatchesListScreen: Fallback error:', fallbackError);
        Alert.alert('Error', 'Failed to load matches');
      }
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    setAuthCheckLogs([]);
    setShowAuthCheck(true);
    
    const addLog = (message: string) => {
      setAuthCheckLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    try {
      addLog('🧪 AuthCheck: Starting authentication check');
      
      // Check if user is logged in
      if (!user) {
        addLog('❌ AuthCheck: No user logged in');
        addLog('❌ AuthCheck: You need to log in first');
        return;
      }

      addLog(`✅ AuthCheck: User is logged in`);
      addLog(`🧪 AuthCheck: User ID: ${user.id}`);
      addLog(`🧪 AuthCheck: User Email: ${user.email}`);
      addLog(`🧪 AuthCheck: User Name: ${user.name}`);

      // Check if this user has any matches in Firestore
      addLog('🧪 AuthCheck: Checking for existing matches in Firestore');
      
      const matchesQuery = query(
        collection(db, COLLECTIONS.MATCHES),
        where('userId', '==', user.id)
      );
      
      const matchesSnapshot = await getDocs(matchesQuery);
      addLog(`🧪 AuthCheck: Found ${matchesSnapshot.size} existing matches for your user ID`);

      if (matchesSnapshot.size === 0) {
        addLog('❌ AuthCheck: No existing matches found for your user ID');
        addLog('❌ AuthCheck: This means you need to create real matches');
        addLog('❌ AuthCheck: OR you might be logged in with the wrong account');
      } else {
        addLog('✅ AuthCheck: Found existing matches!');
        matchesSnapshot.forEach(doc => {
          const data = doc.data();
          addLog(`🧪 AuthCheck: Match ID: ${doc.id}`);
          addLog(`🧪 AuthCheck: Partner: ${data.partnerName}`);
          addLog(`🧪 AuthCheck: Score: ${data.score}%`);
        });
      }

      // Check if there are any matches for the known working user ID
      addLog('🧪 AuthCheck: Checking known working user for comparison');
      const knownUserId = "lfhcWZ2RPmTEbw4Obwax3A98vs83";
      const knownMatchesQuery = query(
        collection(db, COLLECTIONS.MATCHES),
        where('userId', '==', knownUserId)
      );
      
      const knownMatchesSnapshot = await getDocs(knownMatchesQuery);
      addLog(`🧪 AuthCheck: Known user has ${knownMatchesSnapshot.size} matches`);

      if (knownMatchesSnapshot.size > 0 && matchesSnapshot.size === 0) {
        addLog('⚠️ AuthCheck: WARNING: You might be logged in with the wrong account');
        addLog('⚠️ AuthCheck: The known user has matches, but your current user does not');
        addLog('⚠️ AuthCheck: Consider logging in with the account that has matches');
      }

    } catch (error) {
      addLog(`❌ AuthCheck: Error during check: ${error}`);
    }
  };

    const clearTestMatches = async () => {
    try {
      console.log('🧪 MatchesListScreen: Clearing test matches for user:', user!.id);
      
      // Get all test matches for the current user
      const testMatchesQuery = query(
        collection(db, COLLECTIONS.MATCHES),
        where('userId', '==', user!.id)
      );
      
      const testMatchesSnapshot = await getDocs(testMatchesQuery);
      console.log('🧪 MatchesListScreen: Found', testMatchesSnapshot.size, 'test matches to clear');
      
      // Delete all test matches
      const batch = writeBatch(db);
      testMatchesSnapshot.docs.forEach(doc => {
        const data = doc.data();
        // Only delete matches with "Test Partner" in the name
        if (data.partnerName && data.partnerName.includes('Test Partner')) {
          batch.delete(doc.ref);
          console.log('🧪 MatchesListScreen: Deleting test match:', doc.id);
        }
      });
      
      await batch.commit();
      console.log('🧪 MatchesListScreen: Test matches cleared successfully');
      
      // Reload matches after clearing
      await loadMatches();
      
    } catch (error) {
      console.error('🧪 MatchesListScreen: Error clearing test matches:', error);
    }
  };

  const createTestBilateralMatch = async () => {
    try {
      console.log('🧪 MatchesListScreen: Creating test bilateral match');
      
      // First, create the events collection if it doesn't exist
      const testEventId = 'test_event_123';
      const testEventTitle = 'Salsa Night at Club Havana';
      
      // Create the event document first
      const eventRef = doc(db, COLLECTIONS.EVENTS, testEventId);
      await setDoc(eventRef, {
        title: testEventTitle,
        description: 'A fun salsa night for dance partners',
        location: 'Club Havana',
        createdBy: user!.id,
        createdAt: new Date()
      });
      console.log('🧪 MatchesListScreen: Created event document');
      
      const matchResult = await bilateralMatchingService.markInterestAndDetectMatch(
        testEventId,
        testEventTitle,
        'dance_partner'
      );
      
      console.log('🧪 MatchesListScreen: Test bilateral match result:', matchResult);
      
      if (matchResult.matched) {
        console.log('🧪 MatchesListScreen: Test bilateral match created successfully!');
        Alert.alert('Success', 'Test bilateral match created! Check your matches.');
      } else {
        console.log('🧪 MatchesListScreen: No bilateral match found, creating one manually');
        
        // Manually create a bilateral match
        const testPartnerId = 'test_partner_456';
        const testPartnerName = 'Maria Rodriguez';
        
        // Create interest for both users in the same event
        const batch = writeBatch(db);
        
        // Ensure both user documents exist
        const currentUserRef = doc(db, COLLECTIONS.USERS, user!.id);
        await setDoc(currentUserRef, {
          displayName: user!.name || 'Anonymous',
          email: user!.email || '',
          createdAt: new Date(),
          updatedAt: new Date()
        }, { merge: true });
        
        const testPartnerRef = doc(db, COLLECTIONS.USERS, testPartnerId);
        await setDoc(testPartnerRef, {
          displayName: testPartnerName,
          email: 'maria@test.com',
          createdAt: new Date(),
          updatedAt: new Date()
        }, { merge: true });
        
        // Current user's interest
        const userInterestRef = doc(db, COLLECTIONS.USERS, user!.id, 'interested_events', testEventId);
        
        const userInterestData = {
          eventId: testEventId,
          title: testEventTitle,
          intent: 'dance_partner',
          timestamp: new Date(),
          status: 'active'
        };
        
        // Partner's interest
        const partnerInterestRef = doc(db, COLLECTIONS.USERS, testPartnerId, 'interested_events', testEventId);
        
        const partnerInterestData = {
          eventId: testEventId,
          title: testEventTitle,
          intent: 'dance_partner',
          timestamp: new Date(),
          status: 'active'
        };
        
        // Event's interested users
        const eventUserInterestRef = doc(db, COLLECTIONS.EVENTS, testEventId, 'interested_users', user!.id);
        
        const eventUserInterestData = {
          userId: user!.id,
          name: user!.name || 'Anonymous',
          email: user!.email || '',
          intent: 'dance_partner',
          timestamp: new Date(),
          status: 'active'
        };
        
        const eventPartnerInterestRef = doc(db, COLLECTIONS.EVENTS, testEventId, 'interested_users', testPartnerId);
        
        const eventPartnerInterestData = {
          userId: testPartnerId,
          name: testPartnerName,
          email: 'maria@test.com',
          intent: 'dance_partner',
          timestamp: new Date(),
          status: 'active'
        };
        
        batch.set(userInterestRef, userInterestData);
        batch.set(partnerInterestRef, partnerInterestData);
        batch.set(eventUserInterestRef, eventUserInterestData);
        batch.set(eventPartnerInterestRef, eventPartnerInterestData);
        
        await batch.commit();
        
        console.log('🧪 MatchesListScreen: Test bilateral match data created');
        Alert.alert('Success', 'Test bilateral match data created! Reload matches to see it.');
        
        // Reload matches
        await loadMatches();
      }
      
    } catch (error) {
      console.error('🧪 MatchesListScreen: Error creating test bilateral match:', error);
      Alert.alert('Error', 'Failed to create test bilateral match');
    }
  };

  // Create test matches for the current user
  const createTestMatches = async (userId: string) => {
    try {
      console.log('🧪 MatchesListScreen: Creating test matches for user:', userId);
      
      // Create test match 1
      const matchId1 = await matchingService.createMatch(
        userId,
        "test-partner-1",
        "test-event-1",
        85
      );
      console.log('🧪 MatchesListScreen: Created match 1 with ID:', matchId1);
      
      // Create test match 2
      const matchId2 = await matchingService.createMatch(
        userId,
        "test-partner-2", 
        "test-event-2",
        92
      );
      console.log('🧪 MatchesListScreen: Created match 2 with ID:', matchId2);
      
      // Create test match 3
      const matchId3 = await matchingService.createMatch(
        userId,
        "test-partner-3",
        "test-event-3",
        78
      );
      console.log('🧪 MatchesListScreen: Created match 3 with ID:', matchId3);
      
      console.log('🧪 MatchesListScreen: Created 3 test matches');
      
      // Verify the matches were created by querying Firestore directly
      const verifyQuery = query(
        collection(db, COLLECTIONS.MATCHES),
        where('userId', '==', userId)
      );
      const verifySnapshot = await getDocs(verifyQuery);
      console.log('🧪 MatchesListScreen: Verification - found', verifySnapshot.size, 'matches in Firestore');
      
      verifySnapshot.forEach(doc => {
        const data = doc.data();
        console.log('🧪 MatchesListScreen: Verification - match document:', doc.id, data);
      });
      
    } catch (error) {
      console.error('🧪 MatchesListScreen: Error creating test matches:', error);
    }
  };

  const getOtherUserId = (match: Match): string => {
    return match.userId1 === user?.id ? match.userId2 : match.userId1;
  };

  const handleMatchPress = async (match: Match) => {
    try {
      // For now, we'll just show match details
      // In a real app, this would navigate to the chat
      const otherUserId = getOtherUserId(match);
      Alert.alert(
        'Match Details',
        `Match with user ${otherUserId}\nStrength: ${match.matchStrength}%\nCreated: ${match.createdAt.toLocaleDateString()}`,
        [
          {
            text: 'Start Chat',
            onPress: () => {
              // Navigate to chat when chat system is implemented
              console.log('🧪 MatchesListScreen: Would navigate to chat for match:', match.id);
            }
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('🧪 MatchesListScreen: Error handling match press:', error);
    }
  };

  const renderMatchItem = ({ item: match }: { item: Match }) => {
    const otherUserId = getOtherUserId(match);
    const displayName = match.partnerName || `User ${otherUserId.slice(0, 8)}...`;
    const location = match.partnerLocation || 'Unknown location';
    const bio = match.partnerBio || 'No bio available';
    const matchType = match.matchType || 'dance_partner';
    
    return (
      <TouchableOpacity
        style={styles.matchItem}
        onPress={() => handleMatchPress(match)}
        activeOpacity={0.7}
      >
        <View style={styles.matchAvatar}>
          <Ionicons name="person" size={40} color="#6A11CB" />
        </View>
        
        <View style={styles.matchInfo}>
          <Text style={styles.matchName}>{displayName}</Text>
          <Text style={styles.matchLocation}>{location}</Text>
          <Text style={styles.matchBio}>{bio}</Text>
          <Text style={styles.matchType}>{matchType === 'dance_partner' ? 'Dance Partner' : 'Romantic Match'}</Text>
          <Text style={styles.matchStrength}>
            Match Strength: {match.matchStrength}%
          </Text>
          <Text style={styles.matchStatus}>
            Status: {match.status}
          </Text>
          <Text style={styles.matchDate}>
            Matched {match.createdAt.toLocaleDateString()}
          </Text>
          
          {match.partnerInterests && match.partnerInterests.length > 0 && (
            <View style={styles.interestsContainer}>
              <Text style={styles.interestsLabel}>Interests:</Text>
              <View style={styles.interestsList}>
                {match.partnerInterests.slice(0, 3).map((interest, index) => (
                  <Text key={index} style={styles.interestTag}>
                    {interest}
                  </Text>
                ))}
              </View>
            </View>
          )}
        </View>
        
        <View style={styles.matchActions}>
          <TouchableOpacity style={styles.chatButton}>
            <Ionicons name="chatbubble-outline" size={24} color="#6A11CB" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <BackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A11CB" />
          <Text style={styles.loadingText}>Loading matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <BackButton />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Matches</Text>
        <Text style={styles.subtitle}>
          {matches.length} dance partner{matches.length !== 1 ? 's' : ''}
        </Text>
        
        {/* Auth Check Button */}
        <TouchableOpacity 
          style={styles.authCheckButton}
          onPress={checkAuthStatus}
        >
          <Text style={styles.authCheckButtonText}>🔐 Check Auth Status</Text>
        </TouchableOpacity>

        {/* Clear Test Matches Button */}
        <TouchableOpacity 
          style={[styles.authCheckButton, styles.clearTestButton]}
          onPress={clearTestMatches}
        >
          <Text style={styles.authCheckButtonText}>🗑️ Clear Test Matches</Text>
        </TouchableOpacity>

        {/* Create Test Bilateral Match Button */}
        <TouchableOpacity 
          style={[styles.authCheckButton, styles.createTestButton]}
          onPress={createTestBilateralMatch}
        >
          <Text style={styles.authCheckButtonText}>🎯 Create Test Bilateral Match</Text>
        </TouchableOpacity>
      </View>

      {/* Auth Check Results */}
      {showAuthCheck && (
        <View style={styles.authCheckContainer}>
          <View style={styles.authCheckHeader}>
            <Text style={styles.authCheckTitle}>Authentication Check Results</Text>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowAuthCheck(false)}
            >
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.authCheckLogs}>
            {authCheckLogs.map((log, index) => (
              <Text key={index} style={styles.authCheckLog}>{log}</Text>
            ))}
          </ScrollView>
        </View>
      )}

      {matches.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="heart-outline" size={80} color="#6A11CB" />
          <Text style={styles.emptyTitle}>No Matches Yet</Text>
          <Text style={styles.emptySubtitle}>
            Start swiping to find dance partners! Your matches will appear here.
          </Text>
          <TouchableOpacity 
            style={styles.findPartnersButton}
            onPress={() => router.push('/matching')}
          >
            <Text style={styles.findPartnersButtonText}>Find Partners</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatchItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A148C',
  },
  header: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  findPartnersButton: {
    backgroundColor: '#6A11CB',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  findPartnersButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  matchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  matchAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  matchStrength: {
    fontSize: 14,
    color: '#2ed573',
    marginBottom: 3,
  },
  matchStatus: {
    fontSize: 12,
    color: '#ffa502',
    marginBottom: 3,
  },
  matchDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  matchLocation: {
    fontSize: 14,
    color: '#E1BEE7',
    marginTop: 2,
  },
  matchBio: {
    fontSize: 12,
    color: '#CE93D8',
    marginTop: 2,
    fontStyle: 'italic',
  },
  matchType: {
    fontSize: 12,
    color: '#BA68C8',
    marginTop: 2,
    fontWeight: '600',
  },
  interestsContainer: {
    marginTop: 8,
  },
  interestsLabel: {
    fontSize: 12,
    color: '#B39DDB',
    marginBottom: 4,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  interestTag: {
    fontSize: 10,
    color: '#6A11CB',
    backgroundColor: '#E1BEE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  matchActions: {
    marginLeft: 10,
  },
  chatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  authCheckButton: {
    backgroundColor: '#6A11CB',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
  },
  clearTestButton: {
    backgroundColor: '#dc3545',
    marginTop: 10,
  },
  createTestButton: {
    backgroundColor: '#28a745',
    marginTop: 10,
  },
  authCheckButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  authCheckContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 15,
    maxHeight: 300,
  },
  authCheckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  authCheckTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  authCheckLogs: {
    padding: 15,
    maxHeight: 200,
  },
  authCheckLog: {
    color: '#fff',
    fontSize: 11,
    fontFamily: 'monospace',
    lineHeight: 16,
    marginBottom: 3,
  },
});


