import { StripeElementsModal } from '@/components/ui/StripeElementsModal';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { BackButton } from '../ui/BackButton';

const PremiumSubscriptionScreen: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const { user } = useAuth();

  const handlePlanSelection = (plan: 'monthly' | 'annual') => {
    setSelectedPlan(plan);
  };

  const handlePaymentSuccess = (result: any) => {
    console.log('🧪 Payment successful:', result);
    setShowPaymentModal(false);
    // Navigate to success screen or show success message
    router.push('/postLoginWelcome');
  };

  const handlePaymentError = (errorType: string, message: string) => {
    console.error('🧪 Payment error:', errorType, message);
    setShowPaymentModal(false);
  };

  const getSelectedPlan = () => {
    return {
      id: selectedPlan,
      name: selectedPlan === 'monthly' ? 'Premium Monthly' : 'Premium Annual',
      price: selectedPlan === 'monthly' ? '$14.99' : '$149.99',
      period: selectedPlan === 'monthly' ? 'month' : 'year',
      features: selectedPlan === 'monthly' 
        ? ['Unlimited Google Custom Search', 'Advanced Partner Matching', 'Unlimited Chat Messages', 'Priority Support', 'Early Access to New Features', 'Premium Profile Badges']
        : ['All Monthly Features', 'Save 17% ($29.89)', '2 Months Free', 'VIP Status', 'Priority App Updates', 'Exclusive Event Access']
    };
  };

  return (
    <LinearGradient
      colors={['#4A148C', '#1976D2', '#0D47A1']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Premium Subscription</Text>
        </View>

        {/* Premium Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Unlock Premium Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="search" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>Advanced AI Partner Matching</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="videocam" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>Unlimited Video Uploads</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="star" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>Priority Event Booking</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="chatbubbles" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>Unlimited Messaging</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="analytics" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>Detailed Analytics</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
              <Text style={styles.featureText}>Verified Badge</Text>
            </View>
          </View>
        </View>

        {/* Subscription Plans */}
        <View style={styles.plansSection}>
          <Text style={styles.sectionTitle}>Choose Your Plan</Text>
          
          {/* Monthly Plan */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'monthly' && styles.selectedPlan
            ]}
            onPress={() => handlePlanSelection('monthly')}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Premium Monthly</Text>
              <Text style={styles.planPrice}>$14.99</Text>
              <Text style={styles.planPeriod}>per month</Text>
            </View>
            {selectedPlan === 'monthly' && (
              <View style={styles.selectedIndicator}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
            )}
          </TouchableOpacity>

          {/* Annual Plan */}
          <TouchableOpacity
            style={[
              styles.planCard,
              selectedPlan === 'annual' && styles.selectedPlan
            ]}
            onPress={() => handlePlanSelection('annual')}
          >
            <View style={styles.planHeader}>
              <Text style={styles.planName}>Premium Annual</Text>
              <Text style={styles.planPrice}>$149.99</Text>
              <Text style={styles.planPeriod}>per year</Text>
              <View style={styles.savingsBadge}>
                <Text style={styles.savingsText}>Save 17%</Text>
              </View>
            </View>
            {selectedPlan === 'annual' && (
              <View style={styles.selectedIndicator}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Payment Section */}
        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment</Text>
          
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => setShowPaymentModal(true)}
          >
            <Text style={styles.payButtonText}>
              {selectedPlan === 'monthly' ? 'Purchase $14.99' : 'Purchase $149.99'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By subscribing, you agree to our Terms of Service and Privacy Policy.
            Cancel anytime in your account settings.
          </Text>
        </View>
      </ScrollView>

      {/* Payment Modal */}
      <StripeElementsModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        plan={getSelectedPlan()}
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresList: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  featureText: {
    fontSize: 16,
    color: '#fff',
    marginLeft: 15,
    flex: 1,
  },
  plansSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  planCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlan: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  planHeader: {
    alignItems: 'center',
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  planPeriod: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  savingsBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  savingsText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  paymentSection: {
    paddingHorizontal: 20,
  },
  payButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    paddingVertical: 16,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginBottom: 15,
  },
  payButtonDisabled: {
    opacity: 0.6,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  termsText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PremiumSubscriptionScreen;
      <BackButton />