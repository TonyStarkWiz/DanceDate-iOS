import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function OnboardingWelcomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to DanceDate!</Text>
      <Text style={styles.subtitle}>Let's get you started on your dance journey</Text>
      
      <TouchableOpacity 
        style={styles.button}
        onPress={() => router.push('/takeTour')}
      >
        <Text style={styles.buttonText}>Take the Tour</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.skipButton}
        onPress={() => router.push('/(tabs)')}
      >
        <Text style={styles.skipButtonText}>Skip to App</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4A148C',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 50,
    lineHeight: 26,
  },
  button: {
    backgroundColor: '#fff',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  buttonText: {
    color: '#4A148C',
    fontSize: 18,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
  },
  skipButtonText: {
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
});



