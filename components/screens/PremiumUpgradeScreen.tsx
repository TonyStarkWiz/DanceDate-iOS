import { BackButton } from '@/components/ui/BackButton';
import { useAuth } from '@/contexts/AuthContext';
import { googleCustomSearchService } from '@/services/googleCustomSearchService';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export const PremiumUpgradeScreen: React.FC = () => {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [quotaInfo, setQuotaInfo] = useState<{ used: number; total: number; resetDate: string } | null>(null);

  useEffect(() => {
    if (user?.id) {
      checkPremiumStatus();
    }
  }, [user?.id]);

  const checkPremiumStatus = async () => {
    try {
      setLoading(true);
      const premiumStatus = await googleCustomSearchService.isUserPremium(user!.id);
      setIsPremium(premiumStatus);
      
      if (premiumStatus) {
        const quota = await googleCustomSearchService.getSearchQuotaInfo();
        setQuotaInfo(quota);
      }
    } catch (error) {
      console.error('🧪 PremiumUpgradeScreen: Error checking premium status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeToPremium = () => {
    Alert.alert(
      'Upgrade to Premium',
      'This would integrate with your payment system (Stripe/Apple Pay) to upgrade the user to premium status.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Upgrade', 
          onPress: () => {
            // TODO: Integrate with payment system
            Alert.alert('Coming Soon', 'Premium upgrade will be available soon!');
          }
        }
      ]
    );
  };

  const handleTestGoogleSearch = async () => {
    try {
      Alert.alert(
        'Test Google Search',
        'This will test the Google Custom Search API with a sample query.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Test',
            onPress: async () => {
              try {
                const results = await googleCustomSearchService.searchDanceEvents('salsa events', 'New York', 5);
                Alert.alert(
                  'Search Results',
                  `Found ${results.length} results from Google Custom Search!\n\nFirst result: ${results[0]?.title || 'No results'}`
                );
              } catch (error) {
                Alert.alert('Error', `Search failed: ${error.message}`);
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to test Google search');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <BackButton />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6A11CB" />
          <Text style={styles.loadingText}>Checking premium status...</Text>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <BackButton />
      
      {/* Header */}
      <View style={styles.header}>
        <Ionicons 
          name={isPremium ? "diamond" : "diamond-outline"} 
          size={48} 
          color={isPremium ? "#FFD700" : "#999"} 
        />
        <Text style={styles.title}>
          {isPremium ? 'Premium Active' : 'Upgrade to Premium'}
        </Text>
        <Text style={styles.subtitle}>
          {isPremium 
            ? 'You have access to Google Custom Search' 
            : 'Unlock unlimited dance event discovery'
          }
        </Text>
      </View>

      {/* Premium Benefits */}
      <View style={styles.benefitsContainer}>
        <Text style={styles.benefitsTitle}>Premium Benefits</Text>
        
        <View style={styles.benefitItem}>
          <Ionicons name="search" size={24} color="#6A11CB" />
          <View style={styles.benefitText}>
            <Text style={styles.benefitTitle}>Google Custom Search</Text>
            <Text style={styles.benefitDescription}>
              Access to unlimited Google Custom Search results for dance events worldwide
            </Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <Ionicons name="globe" size={24} color="#6A11CB" />
          <View style={styles.benefitText}>
            <Text style={styles.benefitTitle}>Global Event Discovery</Text>
            <Text style={styles.benefitDescription}>
              Find events from any location, not just limited API sources
            </Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <Ionicons name="images" size={24} color="#6A11CB" />
          <View style={styles.benefitText}>
            <Text style={styles.benefitTitle}>Rich Event Details</Text>
            <Text style={styles.benefitDescription}>
              Get images, detailed descriptions, and real-time information
            </Text>
          </View>
        </View>

        <View style={styles.benefitItem}>
          <Ionicons name="time" size={24} color="#6A11CB" />
          <View style={styles.benefitText}>
            <Text style={styles.benefitTitle}>Real-time Updates</Text>
            <Text style={styles.benefitDescription}>
              Always get the latest event information from the web
            </Text>
          </View>
        </View>
      </View>

      {/* Current Status */}
      {isPremium && quotaInfo && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusTitle}>Your Premium Status</Text>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Search Quota:</Text>
            <Text style={styles.statusValue}>
              {quotaInfo.used} / {quotaInfo.total} searches used today
            </Text>
          </View>
          <View style={styles.statusItem}>
            <Text style={styles.statusLabel}>Resets:</Text>
            <Text style={styles.statusValue}>
              {new Date(quotaInfo.resetDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {!isPremium ? (
          <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradeToPremium}>
            <Ionicons name="diamond" size={20} color="#fff" />
            <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.testButton} onPress={handleTestGoogleSearch}>
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.testButtonText}>Test Google Search</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color="#6A11CB" />
          <Text style={styles.backButtonText}>Back to Events</Text>
        </TouchableOpacity>
      </View>

      {/* Technical Info */}
      <View style={styles.techInfoContainer}>
        <Text style={styles.techInfoTitle}>Technical Details</Text>
        <Text style={styles.techInfoText}>
          • Google Custom Search API with 100 free queries per day{'\n'}
          • Custom search engine configured for dance events{'\n'}
          • Real-time web search results{'\n'}
          • Automatic fallback to Dance Events API if needed
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  benefitsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  benefitText: {
    flex: 1,
    marginLeft: 15,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 5,
  },
  benefitDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  statusContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  statusValue: {
    fontSize: 14,
    color: '#FFD700',
    fontWeight: '600',
  },
  actionContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  upgradeButtonText: {
    color: '#1a1a2e',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6A11CB',
    paddingVertical: 15,
    borderRadius: 25,
    marginBottom: 15,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 15,
    borderRadius: 25,
  },
  backButtonText: {
    color: '#6A11CB',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  techInfoContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  techInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  techInfoText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    lineHeight: 18,
  },
});


