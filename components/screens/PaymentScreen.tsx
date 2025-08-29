import { ApplePayButton } from '@/components/ui/ApplePayButton';
import { applePayService, PaymentRequest } from '@/services/applePayService';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Platform,
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
    id: 'premium_monthly',
    title: 'Premium Monthly',
    description: 'Unlock all premium features',
    price: 9.99,
    features: [
      'Unlimited dance partner matches',
      'Priority event booking',
      'Advanced search filters',
      'Premium chat features',
      'No ads',
    ],
    popular: true,
  },
  {
    id: 'premium_yearly',
    title: 'Premium Yearly',
    description: 'Best value - save 40%',
    price: 59.99,
    features: [
      'All monthly features',
      '2 months free',
      'Exclusive events access',
      'Priority customer support',
      'Early access to new features',
    ],
  },
  {
    id: 'event_booking',
    title: 'Event Booking',
    description: 'Book your next dance event',
    price: 29.99,
    features: [
      'Guaranteed spot',
      'Professional instruction',
      'Social networking',
      'Refreshments included',
      'Photo package',
    ],
  },
];

export const PaymentScreen: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<PaymentOption | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOptionSelect = (option: PaymentOption) => {
    setSelectedOption(option);
  };

  const handleApplePayPress = async () => {
    if (!selectedOption) {
      Alert.alert('Select an Option', 'Please select a payment option first.');
      return;
    }

    if (!applePayService.isApplePayAvailable()) {
      Alert.alert(
        'Apple Pay Not Available',
        'Apple Pay is not available on this device or platform.'
      );
      return;
    }

    setIsProcessing(true);

    try {
      const paymentRequest: PaymentRequest = {
        items: [
          {
            label: selectedOption.title,
            amount: selectedOption.price,
            type: 'final',
          },
        ],
        total: {
          label: 'Total',
          amount: selectedOption.price,
          type: 'final',
        },
      };

      const success = await applePayService.requestPayment(paymentRequest);
      
      if (success) {
        // Payment was initiated successfully
        console.log('Apple Pay payment initiated');
      }
    } catch (error) {
      console.error('Apple Pay error:', error);
      Alert.alert('Payment Error', 'Unable to process payment. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentOption = (option: PaymentOption) => (
    <View
      key={option.id}
      style={[
        styles.optionCard,
        selectedOption?.id === option.id && styles.selectedOption,
        option.popular && styles.popularOption,
      ]}
    >
      {option.popular && (
        <View style={styles.popularBadge}>
          <Text style={styles.popularText}>Most Popular</Text>
        </View>
      )}
      
      <View style={styles.optionHeader}>
        <Text style={styles.optionTitle}>{option.title}</Text>
        <Text style={styles.optionPrice}>${option.price.toFixed(2)}</Text>
      </View>
      
      <Text style={styles.optionDescription}>{option.description}</Text>
      
      <View style={styles.featuresList}>
        {option.features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>
      
      <TouchableOpacity
        style={[
          styles.selectButton,
          selectedOption?.id === option.id && styles.selectedButton,
        ]}
        onPress={() => handleOptionSelect(option)}
      >
        <Text style={[
          styles.selectButtonText,
          selectedOption?.id === option.id && styles.selectedButtonText,
        ]}>
          {selectedOption?.id === option.id ? 'Selected' : 'Select'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>
            Unlock premium features and enhance your dance experience
          </Text>
        </View>

        {/* Payment Options */}
        <View style={styles.optionsContainer}>
          {paymentOptions.map(renderPaymentOption)}
        </View>

        {/* Apple Pay Section */}
        {Platform.OS === 'ios' && (
          <View style={styles.applePaySection}>
            <Text style={styles.applePayTitle}>Secure Payment</Text>
            <Text style={styles.applePaySubtitle}>
              Pay securely with Apple Pay
            </Text>
            
            <ApplePayButton
              onPress={handleApplePayPress}
              disabled={!selectedOption || isProcessing}
              title={isProcessing ? 'Processing...' : 'Pay with Apple Pay'}
              style={styles.applePayButton}
            />
            
            <Text style={styles.securityNote}>
              🔒 Your payment information is secure and encrypted
            </Text>
          </View>
        )}

        {/* Non-iOS Message */}
        {Platform.OS !== 'ios' && (
          <View style={styles.nonIosMessage}>
            <Text style={styles.nonIosText}>
              Apple Pay is only available on iOS devices
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    lineHeight: 22,
  },
  optionsContainer: {
    gap: 20,
    marginBottom: 30,
  },
  optionCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  selectedOption: {
    borderColor: '#4A148C',
    backgroundColor: '#2A1A2A',
  },
  popularOption: {
    borderColor: '#FFD700',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  popularText: {
    color: '#000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  optionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  optionPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A148C',
  },
  optionDescription: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 20,
    lineHeight: 20,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#fff',
    marginLeft: 8,
  },
  selectButton: {
    backgroundColor: '#4A148C',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#6A1B9A',
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedButtonText: {
    color: '#fff',
  },
  applePaySection: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  applePayTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  applePaySubtitle: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 20,
    textAlign: 'center',
  },
  applePayButton: {
    width: '100%',
    marginBottom: 16,
  },
  securityNote: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  nonIosMessage: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
  },
  nonIosText: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
});

export default PaymentScreen;
