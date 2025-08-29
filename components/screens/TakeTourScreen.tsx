import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

const { width, height } = Dimensions.get('window');

const tourSteps = [
  {
    title: 'Welcome to DanceDate!',
    description: 'Your ultimate dance partner discovery app',
    icon: '💃',
    color: '#4A148C',
  },
  {
    title: 'Find Events',
    description: 'Discover dance events, classes, and socials near you',
    icon: '🎯',
    color: '#1976D2',
  },
  {
    title: 'Match & Connect',
    description: 'Find your perfect dance partner based on style and preferences',
    icon: '💖',
    color: '#E91E63',
  },
  {
    title: 'Book & Learn',
    description: 'Reserve spots in classes and workshops',
    icon: '📚',
    color: '#FF9800',
  },
  {
    title: 'Share & Grow',
    description: 'Upload videos, track progress, and connect with the community',
    icon: '🚀',
    color: '#4CAF50',
  },
];

export default function TakeTourScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tour complete, navigate to main app
      router.push('/(tabs)');
    }
  };

  const skipTour = () => {
    router.push('/(tabs)');
  };

  const currentTourStep = tourSteps[currentStep];

  return (
    <View style={styles.container}>
      {/* Status Bar Placeholder */}
      <View style={styles.statusBar}>
        <Text style={styles.statusBarText}>6:58</Text>
        <View style={styles.statusBarIcons}>
          <View style={styles.statusBarIcon} />
          <View style={styles.statusBarIcon} />
          <View style={styles.statusBarIcon} />
          <View style={styles.wifiIcon} />
          <View style={styles.batteryIcon} />
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        {tourSteps.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              {
                backgroundColor: index <= currentStep ? '#fff' : 'rgba(255, 255, 255, 0.3)',
              },
            ]}
          />
        ))}
      </View>

      {/* Main Content */}
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stepContainer}>
          <View style={[styles.iconContainer, { backgroundColor: currentTourStep.color }]}>
            <Text style={styles.stepIcon}>{currentTourStep.icon}</Text>
          </View>
          
          <Text style={styles.stepTitle}>{currentTourStep.title}</Text>
          <Text style={styles.stepDescription}>{currentTourStep.description}</Text>
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.skipButton} onPress={skipTour}>
          <Text style={styles.skipButtonText}>Skip Tour</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
          <Text style={styles.nextButtonText}>
            {currentStep === tourSteps.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons 
            name={currentStep === tourSteps.length - 1 ? 'checkmark' : 'arrow-forward'} 
            size={20} 
            color="#fff" 
            style={styles.buttonIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Bottom Home Gesture Bar */}
      <View style={styles.homeBar} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A148C',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  statusBarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBarIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBarIcon: {
    width: 6,
    height: 6,
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  wifiIcon: {
    width: 16,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  batteryIcon: {
    width: 24,
    height: 12,
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  stepContainer: {
    alignItems: 'center',
    maxWidth: 300,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  stepIcon: {
    fontSize: 60,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  stepDescription: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 26,
  },
  bottomContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 30,
  },
  skipButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
  nextButton: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#4A148C',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 10,
  },
  homeBar: {
    height: 4,
    backgroundColor: '#333',
    marginHorizontal: 120,
    marginBottom: 20,
    borderRadius: 2,
  },
});



