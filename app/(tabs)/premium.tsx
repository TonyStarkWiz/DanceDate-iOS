import { PremiumUpgradePopup } from '@/components/ui/PremiumUpgradePopup';
import { useAuth } from '@/contexts/AuthContext';
import { premiumUpgradeManager } from '@/services/premiumUpgradeManager';
import { Ionicons } from '@expo/vector-icons';
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

export default function PremiumTab() {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showPaywall, setShowPaywall] = useState(false);
  const [premiumTriggerType, setPremiumTriggerType] = useState<string>('premium_tab');
  const [premiumCountdown, setPremiumCountdown] = useState(900); // 15 minutes

  useEffect(() => {
    if (user?.id) {
      checkPremiumStatus();
    }
  }, [user?.id]);

  const checkPremiumStatus = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const premiumStatus = await premiumUpgradeManager.isUserPremium(user.id);
        setIsPremium(premiumStatus);
        
        if (!premiumStatus) {
          // Show paywall for non-premium users
          setShowPaywall(true);
        }
      }
    } catch (error) {
      console.error('🧪 PremiumTab: Error checking premium status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeSuccess = () => {
    setShowPaywall(false);
    setIsPremium(true);
    Alert.alert('🎉 Welcome to Premium!', 'You now have access to all premium features!');
  };

  const handleUpgradeClose = () => {
    setShowPaywall(false);
    if (user?.id) {
      premiumUpgradeManager.recordPopupDismissed(user.id, premiumTriggerType);
    }
  };

  const handleShowPaywall = () => {
    setShowPaywall(true);
    setPremiumTriggerType('manual_upgrade');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6A11CB" />
        <Text style={styles.loadingText}>Loading Premium Status...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons 
            name={isPremium ? "diamond" : "diamond-outline"} 
            size={40} 
            color={isPremium ? "#FFD700" : "#6A11CB"} 
          />
          <Text style={styles.title}>
            {isPremium ? "Premium Member" : "Upgrade to Premium"}
          </Text>
          <Text style={styles.subtitle}>
            {isPremium 
              ? "You have access to all premium features!" 
              : "Unlock exclusive features and enhance your dance experience"
            }
          </Text>
        </View>
      </View>

      {/* Premium Status Card */}
      <View style={styles.statusCard}>
        <View style={styles.statusHeader}>
          <Ionicons 
            name={isPremium ? "checkmark-circle" : "lock-closed"} 
            size={24} 
            color={isPremium ? "#4CAF50" : "#FF5722"} 
          />
          <Text style={styles.statusTitle}>
            {isPremium ? "Premium Active" : "Free Plan"}
          </Text>
        </View>
        <Text style={styles.statusDescription}>
          {isPremium 
            ? "Enjoy unlimited access to all premium features"
            : "Upgrade to unlock premium features and remove limitations"
          }
        </Text>
      </View>

      {/* Premium Features */}
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>Premium Features</Text>
        
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Ionicons name="search" size={24} color="#6A11CB" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Unlimited Google Search</Text>
              <Text style={styles.featureDescription}>
                Search for dance events and partners without limits
              </Text>
            </View>
            <Ionicons 
              name={isPremium ? "checkmark-circle" : "lock-closed"} 
              size={20} 
              color={isPremium ? "#4CAF50" : "#999"} 
            />
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="heart" size={24} color="#6A11CB" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Advanced Partner Matching</Text>
              <Text style={styles.featureDescription}>
                Get matched with compatible dance partners
              </Text>
            </View>
            <Ionicons 
              name={isPremium ? "checkmark-circle" : "lock-closed"} 
              size={20} 
              color={isPremium ? "#4CAF50" : "#999"} 
            />
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="chatbubble" size={24} color="#6A11CB" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Unlimited Chat Messages</Text>
              <Text style={styles.featureDescription}>
                Chat with unlimited dance partners
              </Text>
            </View>
            <Ionicons 
              name={isPremium ? "checkmark-circle" : "lock-closed"} 
              size={20} 
              color={isPremium ? "#4CAF50" : "#999"} 
            />
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="star" size={24} color="#6A11CB" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Priority Support</Text>
              <Text style={styles.featureDescription}>
                Get priority customer support
              </Text>
            </View>
            <Ionicons 
              name={isPremium ? "checkmark-circle" : "lock-closed"} 
              size={20} 
              color={isPremium ? "#4CAF50" : "#999"} 
            />
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="rocket" size={24} color="#6A11CB" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Early Access</Text>
              <Text style={styles.featureDescription}>
                Get early access to new features
              </Text>
            </View>
            <Ionicons 
              name={isPremium ? "checkmark-circle" : "lock-closed"} 
              size={20} 
              color={isPremium ? "#4CAF50" : "#999"} 
            />
          </View>

          <View style={styles.featureItem}>
            <Ionicons name="ribbon" size={24} color="#6A11CB" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Premium Badges</Text>
              <Text style={styles.featureDescription}>
                Show off your premium status
              </Text>
            </View>
            <Ionicons 
              name={isPremium ? "checkmark-circle" : "lock-closed"} 
              size={20} 
              color={isPremium ? "#4CAF50" : "#999"} 
            />
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionSection}>
        {!isPremium ? (
          <>
            <TouchableOpacity 
              style={styles.upgradeButton}
              onPress={handleShowPaywall}
            >
              <Ionicons name="diamond" size={24} color="#fff" />
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.learnMoreButton}
              onPress={() => Alert.alert('Learn More', 'Premium features coming soon!')}
            >
              <Text style={styles.learnMoreText}>Learn More About Premium</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.premiumActiveCard}>
            <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
            <Text style={styles.premiumActiveTitle}>Premium Active!</Text>
            <Text style={styles.premiumActiveDescription}>
              You're enjoying all premium features
            </Text>
          </View>
        )}
      </View>

      {/* Premium Upgrade Popup */}
      <PremiumUpgradePopup
        visible={showPaywall}
        onClose={handleUpgradeClose}
        onSuccess={handleUpgradeSuccess}
        triggerType={premiumTriggerType as any}
        countdownSeconds={premiumCountdown}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A148C',
  },
  contentContainer: {
    paddingBottom: 100, // Account for tab bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4A148C',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 30,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  statusDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  featureList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  featureContent: {
    flex: 1,
    marginLeft: 16,
    marginRight: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
  },
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    marginBottom: 16,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  upgradeButtonText: {
    color: '#4A148C',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  learnMoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  learnMoreText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  premiumActiveCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderRadius: 15,
    padding: 24,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  premiumActiveTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 12,
    marginBottom: 8,
  },
  premiumActiveDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
});
