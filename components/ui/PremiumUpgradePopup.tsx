// Premium Upgrade Popup - High Conversion Rate Module
// Follows internet marketing best practices with timer, urgency, and Stripe integration

import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { StripeElementsModal } from './StripeElementsModal';
import { Toast } from './Toast';

const { width, height } = Dimensions.get('window');

interface PremiumPlan {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  stripePriceId: string;
  features: string[];
  isPopular?: boolean;
  savings?: string;
}

interface PremiumUpgradePopupProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  triggerType?: 'usage_limit' | 'feature_access' | 'promotional' | 'timer';
  countdownSeconds?: number;
}

export const PremiumUpgradePopup: React.FC<PremiumUpgradePopupProps> = ({
  visible,
  onClose,
  onSuccess,
  triggerType = 'promotional',
  countdownSeconds = 900 // 15 minutes for better conversion
}) => {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('annual'); // Default to annual for higher conversion
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(countdownSeconds);
  const [showUrgency, setShowUrgency] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Premium plans with Stripe integration
  const premiumPlans: PremiumPlan[] = [
    {
      id: 'monthly',
      name: 'Premium Monthly',
      price: '$14.99',
      period: 'month',
      stripePriceId: 'price_1S1owyBbx323AwXG6K38Xemb',
      features: [
        '✨ Unlimited Google Custom Search',
        '🎯 Advanced Partner Matching',
        '💬 Unlimited Chat Messages',
        '📊 Priority Support',
        '🚀 Early Access to New Features',
        '🎨 Premium Profile Badges'
      ]
    },
    {
      id: 'annual',
      name: 'Premium Annual',
      price: '$149.99',
      originalPrice: '$179.88',
      period: 'year',
      stripePriceId: 'price_1S1oyZBbx323AwXGlCne4izj',
      features: [
        '✨ All Monthly Features',
        '💰 Save 17% ($29.89)',
        '🎁 2 Months Free',
        '🏆 VIP Status',
        '📱 Priority App Updates',
        '🎪 Exclusive Event Access'
      ],
      isPopular: true,
      savings: 'Save $29.89'
    }
  ];

  // Timer countdown effect
  useEffect(() => {
    if (visible && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [visible, timeLeft]);

  // Show urgency when time is running low
  useEffect(() => {
    if (timeLeft <= 60) { // Last minute
      setShowUrgency(true);
      // Pulse animation for urgency
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [timeLeft]);

  // Animation effects
  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Stripe payment
  const handleUpgrade = async () => {
    if (!user) {
      Alert.alert('Sign In Required', 'Please sign in to upgrade to premium.');
      return;
    }

    const selectedPlanData = premiumPlans.find(plan => plan.id === selectedPlan);
    if (!selectedPlanData) {
      Alert.alert('Error', 'Please select a plan to continue.');
      return;
    }

    setShowPaymentModal(true);
  };

  // Handle payment success
  const handlePaymentSuccess = (paymentResult: any) => {
    console.log('🧪 Payment successful:', paymentResult);
    
    // Update premium status in localStorage (in real app, this would be Firestore)
    if (user?.id) {
      const premiumKey = `premium_${user.id}`;
      localStorage.setItem(premiumKey, 'true');
      
      // Update plan info
      const planKey = `plan_${user.id}`;
      localStorage.setItem(planKey, selectedPlan);
      
      console.log('🧪 Premium status updated for user:', user.id);
    }

    setShowPaymentModal(false);
    
    // Show success toast
    setToastMessage(`🎉 Payment Successful! Welcome to Premium ${selectedPlan === 'annual' ? 'Annual' : 'Monthly'}!`);
    setToastType('success');
    setShowToast(true);
    
    // Close the popup after a short delay
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  // Handle payment errors with specific messages
  const handlePaymentError = (errorType: string, errorMessage: string) => {
    let toastMessage = '';
    let toastType: 'success' | 'error' | 'info' = 'error';
    
    switch (errorType) {
      case 'card_declined':
        toastMessage = '❌ Card Declined: Your card was declined. Please try a different card.';
        break;
      case 'insufficient_funds':
        toastMessage = '💰 Insufficient Funds: Please try a different card or add funds to your account.';
        break;
      case 'expired_card':
        toastMessage = '📅 Expired Card: Your card has expired. Please use a different card.';
        break;
      case 'invalid_cvc':
        toastMessage = '🔒 Invalid CVC: Please check your card security code and try again.';
        break;
      case 'invalid_number':
        toastMessage = '💳 Invalid Card Number: Please check your card details and try again.';
        break;
      case 'network_error':
        toastMessage = '🌐 Network Error: Please check your connection and try again.';
        break;
      default:
        toastMessage = '❌ Payment Error: There was an error processing your payment. Please try again.';
    }
    
    setToastMessage(toastMessage);
    setToastType(toastType);
    setShowToast(true);
  };

  // Track current page when popup opens
  useEffect(() => {
    if (visible) {
      // Reset timer when popup opens
      setTimeLeft(countdownSeconds);
    }
  }, [visible, countdownSeconds]);
  const loadStripe = async (publishableKey: string) => {
    try {
      const { loadStripe } = await import('@stripe/stripe-js');
      return await loadStripe(publishableKey);
    } catch (error) {
      console.error('Error loading Stripe:', error);
      return null;
    }
  };

  const selectedPlanData = premiumPlans.find(plan => plan.id === selectedPlan);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <Animated.View 
          style={[
            styles.container,
            {
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          {/* Header with urgency timer */}
          <LinearGradient
            colors={showUrgency ? ['#FF6B6B', '#FF8E8E'] : ['#6A11CB', '#2575FC']}
            style={styles.header}
          >
            <View style={styles.headerContent}>
              <View style={styles.titleContainer}>
                <Ionicons name="diamond" size={24} color="#FFD700" />
                <Text style={styles.title}>Upgrade to Premium</Text>
              </View>
              
              {/* Urgency Timer */}
              <Animated.View 
                style={[
                  styles.timerContainer,
                  { transform: [{ scale: pulseAnim }] }
                ]}
              >
                <Ionicons 
                  name="time" 
                  size={16} 
                  color={showUrgency ? "#FFD700" : "#fff"} 
                />
                <Text style={[styles.timerText, showUrgency && styles.timerTextUrgent]}>
                  {formatTime(timeLeft)}
                </Text>
              </Animated.View>
            </View>
            
            {/* Urgency message */}
            {showUrgency && (
              <Text style={styles.urgencyText}>
                ⚡ Limited Time Offer - Don't Miss Out!
              </Text>
            )}
          </LinearGradient>

          {/* Social Proof */}
          <View style={styles.socialProof}>
            <Text style={styles.socialProofText}>
              🎉 Join 10,000+ dancers who upgraded this month!
            </Text>
          </View>

          {/* Plan Selection */}
          <View style={styles.plansContainer}>
            {premiumPlans.map((plan) => (
              <TouchableOpacity
                key={plan.id}
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.planCardSelected,
                  plan.isPopular && styles.planCardPopular
                ]}
                onPress={() => setSelectedPlan(plan.id)}
              >
                {plan.isPopular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </View>
                )}
                
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan.name}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.price}>{plan.price}</Text>
                    <Text style={styles.period}>/{plan.period}</Text>
                    {plan.originalPrice && (
                      <Text style={styles.originalPrice}>{plan.originalPrice}</Text>
                    )}
                  </View>
                  {plan.savings && (
                    <Text style={styles.savings}>{plan.savings}</Text>
                  )}
                </View>

                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Guarantee */}
          <View style={styles.guarantee}>
            <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
            <Text style={styles.guaranteeText}>
              30-Day Money-Back Guarantee • Cancel Anytime
            </Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={handleUpgrade}
            >
              <Ionicons name="diamond" size={20} color="#FFD700" />
              <Text style={styles.upgradeButtonText}>
                {showUrgency ? '⚡ Upgrade Now' : 'Upgrade to Premium'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={onClose}
            >
              <Text style={styles.skipButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>

      {/* Stripe Payment Modal */}
      <StripeElementsModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        plan={premiumPlans.find(plan => plan.id === selectedPlan) || premiumPlans[0]}
      />

      {/* Toast Notification */}
      <Toast
        visible={showToast}
        message={toastMessage}
        type={toastType}
        duration={4000}
        onHide={() => setShowToast(false)}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: width - 40,
    maxHeight: height - 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  timerTextUrgent: {
    color: '#FFD700',
  },
  urgencyText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  socialProof: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    alignItems: 'center',
  },
  socialProofText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  plansContainer: {
    padding: 20,
  },
  planCard: {
    borderWidth: 2,
    borderColor: '#E9ECEF',
    borderRadius: 15,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  planCardSelected: {
    borderColor: '#6A11CB',
    backgroundColor: 'rgba(106, 17, 203, 0.05)',
  },
  planCardPopular: {
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.05)',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#1a1a2e',
    fontSize: 10,
    fontWeight: 'bold',
  },
  planHeader: {
    marginBottom: 12,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6A11CB',
  },
  period: {
    fontSize: 16,
    color: '#666',
    marginLeft: 4,
  },
  originalPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  savings: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  featuresContainer: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  guarantee: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  guaranteeText: {
    color: '#666',
    fontSize: 12,
    marginLeft: 6,
  },
  actionButtons: {
    padding: 20,
    paddingTop: 0,
  },
  upgradeButton: {
    backgroundColor: '#6A11CB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#6A11CB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  upgradeButtonDisabled: {
    opacity: 0.7,
  },
  upgradeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  skipButtonText: {
    color: '#666',
    fontSize: 14,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
