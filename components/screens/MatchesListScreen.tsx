import { BackButton } from '@/components/ui/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { matchingService } from '@/services/matchingService';
import { Match } from '@/types/matching';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export const MatchesListScreen: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadMatches();
    }
  }, [user?.id]);

  const loadMatches = async () => {
    try {
      setLoading(true);
      console.log('🧪 MatchesListScreen: Loading matches...');
      
      const userMatches = await matchingService.getUserMatches(user!.id);
      setMatches(userMatches);
      
      console.log('🧪 MatchesListScreen: Loaded', userMatches.length, 'matches');
    } catch (error) {
      console.error('🧪 MatchesListScreen: Error loading matches:', error);
      Alert.alert('Error', 'Failed to load matches');
    } finally {
      setLoading(false);
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
          <Text style={styles.matchName}>User {otherUserId.slice(0, 8)}...</Text>
          <Text style={styles.matchStrength}>
            Match Strength: {match.matchStrength}%
          </Text>
          <Text style={styles.matchDate}>
            Matched {match.createdAt.toLocaleDateString()}
          </Text>
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
      </View>

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
  matchDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
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
});


