import { paymentService } from '@/services/paymentService';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

interface PremiumPlan {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
}

interface StripeElementsModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
  plan: PremiumPlan;
  onError?: (errorType: string, message: string) => void;
}

export const StripeElementsModal: React.FC<StripeElementsModalProps> = ({
  visible,
  onClose,
  onSuccess,
  plan,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'setup' | 'processing' | 'success' | 'error'>('setup');
  const [error, setError] = useState<string>('');

  // Process payment when modal opens
  useEffect(() => {
    if (visible) {
      // Reset state when modal opens
      setPaymentStep('setup');
      setError('');
    }
  }, [visible]);

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      setPaymentStep('processing');
      console.log('🧪 Starting payment for plan:', plan.id, 'on platform:', Platform.OS);

      const result = await paymentService.processPayment(plan.id, 'user@example.com');
      
      console.log('🧪 Payment result:', result);

      if (result.success) {
        console.log('🧪 Payment successful');
        setPaymentStep('success');
        
        const paymentResult = {
          id: result.transactionId || 'payment_success',
          amount: plan.price,
          currency: 'usd',
          plan: plan,
          method: Platform.OS === 'ios' ? 'ios_iap' : 'stripe_checkout'
        };

        onSuccess(paymentResult);
      } else {
        console.error('🧪 Payment failed:', result.error);
        setError(result.error || 'Payment failed');
        setPaymentStep('error');
        
        if (onError) {
          onError('payment', result.error || 'Payment failed');
        }
      }

    } catch (error) {
      console.error('🧪 Payment error:', error);
      setError(error instanceof Error ? error.message : 'Payment failed');
      setPaymentStep('error');
      
      if (onError) {
        onError('general', 'Payment failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setPaymentStep('setup');
    setError('');
    handlePayment();
  };

  const handleClose = () => {
    setPaymentStep('setup');
    setError('');
    onClose();
  };

  const getPaymentMethodName = () => {
    return Platform.OS === 'ios' ? 'In-App Purchase' : 'Stripe Checkout';
  };

  const getSecurityText = () => {
    return Platform.OS === 'ios' 
      ? 'Your payment is secured by Apple' 
      : 'Your payment information is secured by Stripe';
  };

  const getButtonText = () => {
    if (isLoading) {
      return 'Processing...';
    }
    return Platform.OS === 'ios' ? `Purchase ${plan.price}` : `Pay ${plan.price}`;
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            style={styles.header}
          >
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Secure Payment</Text>
            <View style={styles.secureBadge}>
              <Ionicons name="shield-checkmark" size={16} color="#fff" />
              <Text style={styles.secureText}>Secure</Text>
            </View>
          </LinearGradient>

          {/* Plan Summary */}
          <View style={styles.planSummary}>
            <Text style={styles.planTitle}>{plan.name}</Text>
            <Text style={styles.planPrice}>{plan.price}</Text>
            <Text style={styles.planPeriod}>per {plan.period}</Text>
          </View>

          {/* Payment Container */}
          <View style={styles.paymentContainer}>
            {isLoading && paymentStep === 'processing' ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#667eea" />
                <Text style={styles.loadingText}>Processing payment...</Text>
              </View>
            ) : paymentStep === 'success' ? (
              <View style={styles.successContainer}>
                <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
                <Text style={styles.successTitle}>Payment Successful!</Text>
                <Text style={styles.successText}>Welcome to {plan.name}!</Text>
              </View>
            ) : paymentStep === 'error' ? (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={64} color="#f44336" />
                <Text style={styles.errorTitle}>Payment Failed</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.checkoutContainer}>
                <Text style={styles.checkoutTitle}>Complete Your Payment</Text>
                <Text style={styles.checkoutDescription}>
                  {Platform.OS === 'ios' 
                    ? 'This will use Apple\'s In-App Purchase system for App Store compliance.'
                    : 'You\'ll be redirected to Stripe\'s secure payment page to complete your subscription.'
                  }
                </Text>
                
                <View style={styles.securityInfo}>
                  <Ionicons name="lock-closed" size={20} color="#4CAF50" />
                  <Text style={styles.securityText}>
                    {getSecurityText()}
                  </Text>
                </View>

                <View style={styles.paymentMethodInfo}>
                  <Ionicons 
                    name={Platform.OS === 'ios' ? 'logo-apple' : 'card'} 
                    size={24} 
                    color="#667eea" 
                  />
                  <Text style={styles.paymentMethodText}>
                    Payment Method: {getPaymentMethodName()}
                  </Text>
                </View>

                <TouchableOpacity 
                  style={styles.payButton} 
                  onPress={handlePayment}
                  disabled={isLoading}
                >
                  <Text style={styles.payButtonText}>
                    {getButtonText()}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 40,
  },
  closeButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  secureText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 5,
  },
  planSummary: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  planTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  planPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 5,
  },
  planPeriod: {
    fontSize: 16,
    color: '#666',
  },
  paymentContainer: {
    padding: 20,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginTop: 15,
    marginBottom: 10,
  },
  successText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#f44336',
    marginTop: 15,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkoutContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  checkoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  checkoutDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  securityText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 10,
    fontWeight: '500',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f4ff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    marginBottom: 30,
  },
  paymentMethodText: {
    fontSize: 14,
    color: '#667eea',
    marginLeft: 10,
    fontWeight: '500',
  },
  payButton: {
    backgroundColor: '#667eea',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    minWidth: 200,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});