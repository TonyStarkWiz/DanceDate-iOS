import { BottomNavBar } from '@/components/ui/BottomNavBar';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

// Mock data for matches - replace with real API calls later
const mockMatches = [
  {
    id: '1',
    name: 'Maria Rodriguez',
    location: 'Downtown, NYC',
    experience: 'Intermediate',
    danceStyles: ['Salsa', 'Bachata'],
    matchPercentage: 95,
    lastActive: '2 hours ago',
    imageUrl: null,
  },
  {
    id: '2',
    name: 'Carlos Mendez',
    location: 'Brooklyn, NYC',
    experience: 'Advanced',
    danceStyles: ['Salsa', 'Kizomba', 'Bachata'],
    matchPercentage: 88,
    lastActive: '1 day ago',
    imageUrl: null,
  },
  {
    id: '3',
    name: 'Elena Vasquez',
    location: 'Queens, NYC',
    experience: 'Beginner',
    danceStyles: ['Salsa'],
    matchPercentage: 82,
    lastActive: '3 days ago',
    imageUrl: null,
  },
  {
    id: '4',
    name: 'David Kim',
    location: 'Manhattan, NYC',
    experience: 'Intermediate',
    danceStyles: ['West Coast Swing', 'Hustle'],
    matchPercentage: 78,
    lastActive: '1 week ago',
    imageUrl: null,
  },
  {
    id: '5',
    name: 'Sophia Chen',
    location: 'Bronx, NYC',
    experience: 'Advanced',
    danceStyles: ['Argentine Tango', 'Waltz'],
    matchPercentage: 91,
    lastActive: '5 hours ago',
    imageUrl: null,
  },
];

interface Match {
  id: string;
  name: string;
  location: string;
  experience: string;
  danceStyles: string[];
  matchPercentage: number;
  lastActive: string;
  imageUrl: string | null;
}

export const AllMatchesScreen: React.FC = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Match[]>(mockMatches);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleMatchPress = (match: Match) => {
    router.push(`/partnerProfile/${match.id}`);
  };

  const handleStartChat = (match: Match) => {
    router.push(`/chat/${match.id}`);
  };

  const handleViewProfile = (match: Match) => {
    router.push(`/partnerProfile/${match.id}`);
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 90) return '#4CAF50';
    if (percentage >= 80) return '#8BC34A';
    if (percentage >= 70) return '#FFC107';
    return '#FF5722';
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A4C93" />
          <Text style={styles.loadingText}>Loading Your Matches...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>All Matches</Text>
        <Text style={styles.headerSubtitle}>Your dance partner connections</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{matches.length}</Text>
            <Text style={styles.statLabel}>Total Matches</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {matches.filter(m => m.matchPercentage >= 90).length}
            </Text>
            <Text style={styles.statLabel}>High Matches</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {matches.filter(m => m.lastActive.includes('hours') || m.lastActive.includes('day')).length}
            </Text>
            <Text style={styles.statLabel}>Recently Active</Text>
          </View>
        </View>

        {/* Matches List */}
        <View style={styles.matchesContainer}>
          <Text style={styles.sectionTitle}>Your Matches</Text>
          
          {matches.map((match) => (
            <TouchableOpacity
              key={match.id}
              style={styles.matchCard}
              onPress={() => handleMatchPress(match)}
              activeOpacity={0.7}
            >
              <View style={styles.matchHeader}>
                <View style={styles.matchInfo}>
                  <View style={styles.avatarPlaceholder}>
                    <Text style={styles.avatarText}>
                      {match.name.split(' ').map(n => n[0]).join('')}
                    </Text>
                  </View>
                  <View style={styles.matchDetails}>
                    <Text style={styles.matchName}>{match.name}</Text>
                    <Text style={styles.matchLocation}>📍 {match.location}</Text>
                    <Text style={styles.matchExperience}>Level: {match.experience}</Text>
                  </View>
                </View>
                
                <View style={styles.matchPercentage}>
                  <Text style={[
                    styles.percentageText,
                    { color: getMatchColor(match.matchPercentage) }
                  ]}>
                    {match.matchPercentage}%
                  </Text>
                  <Text style={styles.matchLabel}>Match</Text>
                </View>
              </View>

              <View style={styles.danceStylesContainer}>
                {match.danceStyles.map((style, index) => (
                  <View key={index} style={styles.styleTag}>
                    <Text style={styles.styleTagText}>{style}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.matchFooter}>
                <Text style={styles.lastActiveText}>
                  Last active: {match.lastActive}
                </Text>
                
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleStartChat(match)}
                  >
                    <Ionicons name="chatbubble" size={16} color="#6A4C93" />
                    <Text style={styles.actionButtonText}>Chat</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleViewProfile(match)}
                  >
                    <Ionicons name="person" size={16} color="#6A4C93" />
                    <Text style={styles.actionButtonText}>Profile</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Empty State */}
        {matches.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Matches Yet</Text>
            <Text style={styles.emptyStateText}>
              Start exploring dance events and connect with potential partners!
            </Text>
            <TouchableOpacity
              style={styles.exploreButton}
              onPress={() => router.push('/eventList')}
            >
              <Text style={styles.exploreButtonText}>Explore Events</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Bottom Navigation Bar */}
      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6A11CB',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: '#6A11CB',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
  },
  matchesContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  matchCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  matchInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6A4C93',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  matchDetails: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  matchLocation: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 2,
  },
  matchExperience: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  matchPercentage: {
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  matchLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
  },
  danceStylesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  styleTag: {
    backgroundColor: '#6A4C93',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  styleTagText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastActiveText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.6,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  actionButtonText: {
    color: '#6A4C93',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  exploreButton: {
    backgroundColor: '#6A4C93',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 100,
  },
});

