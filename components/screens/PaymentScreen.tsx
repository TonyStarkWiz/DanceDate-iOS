import { StripeElementsModal } from '@/components/ui/StripeElementsModal';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface PaymentOption {
  id: string;
  title: string;
  description: string;
  price: number;
  features: string[];
  popular?: boolean;
}

const paymentOptions: PaymentOption[] = [
  {
    id: 'monthly',
    title: 'Premium Monthly',
    description: 'Unlock all premium features',
    price: 14.99,
    features: [
      'Unlimited Google Custom Search',
      'Advanced Partner Matching',
      'Unlimited Chat Messages',
      'Priority Support',
      'Early Access to New Features',
      'Premium Profile Badges',
    ],
    popular: true,
  },
  {
    id: 'annual',
    title: 'Premium Annual',
    description: 'Best value - save 17%',
    price: 149.99,
    features: [
      'All Monthly Features',
      'Save 17% ($29.89)',
      '2 Months Free',
      'VIP Status',
      'Priority App Updates',
      'Exclusive Event Access',
    ],
  },
];

export const PaymentScreen: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<PaymentOption | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const handleOptionSelect = (option: PaymentOption) => {
    setSelectedOption(option);
  };

  const handlePaymentSuccess = (result: any) => {
    console.log('🧪 Payment successful:', result);
    setShowPaymentModal(false);
    // Navigate to success screen
    router.push('/postLoginWelcome');
  };

  const handlePaymentError = (errorType: string, message: string) => {
    console.error('🧪 Payment error:', errorType, message);
    setShowPaymentModal(false);
  };

  const getSelectedPlan = () => {
    if (!selectedOption) return null;
    
    return {
      id: selectedOption.id,
      name: selectedOption.title,
      price: `$${selectedOption.price}`,
      period: selectedOption.id === 'monthly' ? 'month' : 'year',
      features: selectedOption.features
    };
  };

  const renderPaymentOption = (option: PaymentOption) => (
    <TouchableOpacity
      key={option.id}
      style={[
        styles.optionCard,
        selectedOption?.id === option.id && styles.selectedOption,
        option.popular && styles.popularOption,
      ]}
      onPress={() => handleOptionSelect(option)}
    >
      {option.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>MOST POPULAR</Text>
        </View>
      )}
      
      <View style={styles.optionHeader}>
        <Text style={styles.optionTitle}>{option.title}</Text>
        <Text style={styles.optionDescription}>{option.description}</Text>
        <Text style={styles.optionPrice}>${option.price}</Text>
        <Text style={styles.optionPeriod}>
          {option.id === 'monthly' ? 'per month' : 'per year'}
        </Text>
      </View>

      <View style={styles.featuresContainer}>
        {option.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      {selectedOption?.id === option.id && (
        <View style={styles.selectedIndicator}>
          <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Choose Your Plan</Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Unlock premium features and enhance your dance experience
        </Text>

        {/* Payment Options */}
        <View style={styles.optionsContainer}>
          {paymentOptions.map(renderPaymentOption)}
        </View>

        {/* Payment Button */}
        {selectedOption && (
          <TouchableOpacity
            style={styles.paymentButton}
            onPress={() => setShowPaymentModal(true)}
          >
            <Text style={styles.paymentButtonText}>
              {selectedOption.id === 'monthly' ? 'Purchase $14.99' : 'Purchase $149.99'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Terms */}
        <Text style={styles.termsText}>
          By subscribing, you agree to our Terms of Service and Privacy Policy.
          Cancel anytime in your account settings.
        </Text>
      </ScrollView>

      {/* Payment Modal */}
      {selectedOption && (
        <StripeElementsModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          plan={getSelectedPlan()!}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  optionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8',
  },
  popularOption: {
    borderColor: '#FFD700',
    backgroundColor: '#fffef0',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 20,
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
  },
  popularText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  optionHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  optionPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  optionPeriod: {
    fontSize: 14,
    color: '#666',
  },
  featuresContainer: {
    marginBottom: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 15,
    right: 15,
  },
  paymentButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 15,
    paddingVertical: 16,
    paddingHorizontal: 30,
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  paymentButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  termsText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
});

export default PaymentScreen;