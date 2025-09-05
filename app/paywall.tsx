import { PremiumUpgradePopup } from '@/components/ui/PremiumUpgradePopup';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function PaywallScreen() {
  const { user } = useAuth();
  const [showPaywall, setShowPaywall] = useState(true);
  const [premiumTriggerType, setPremiumTriggerType] = useState<string>('standalone_paywall');
  const [premiumCountdown, setPremiumCountdown] = useState(900); // 15 minutes

  const handleUpgradeSuccess = () => {
    setShowPaywall(false);
    Alert.alert('🎉 Welcome to Premium!', 'You now have access to all premium features!', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const handleUpgradeClose = () => {
    setShowPaywall(false);
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.closeButton}
          onPress={() => router.back()}
        >
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Ionicons name="diamond" size={40} color="#FFD700" />
          <Text style={styles.title}>Unlock Premium Features</Text>
          <Text style={styles.subtitle}>
            Get unlimited access to all premium features
          </Text>
        </View>
      </View>

      {/* Premium Upgrade Popup */}
      <PremiumUpgradePopup
        visible={showPaywall}
        onClose={handleUpgradeClose}
        onSuccess={handleUpgradeSuccess}
        triggerType={premiumTriggerType as any}
        countdownSeconds={premiumCountdown}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A148C',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 8,
    marginBottom: 20,
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
});
