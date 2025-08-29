import { Stack } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

function RootLayoutContent() {
  const { user, loading } = useAuth();
  const [forceShow, setForceShow] = React.useState(false);

  // Force show after 10 seconds if still loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setForceShow(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [loading]);

  if (loading && !forceShow) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4A148C' }}>
        <Text style={{ color: '#fff', fontSize: 18 }}>Loading DanceDate...</Text>
        <Text style={{ color: '#fff', fontSize: 14, marginTop: 10, opacity: 0.8 }}>
          Will auto-skip in {10 - Math.floor((Date.now() % 10000) / 1000)} seconds
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        {/* Onboarding & Authentication Flow */}
        <Stack.Screen name="entry" />
        <Stack.Screen name="welcome" />
        <Stack.Screen name="onboardingWelcome" />
        <Stack.Screen name="takeTour" />
        <Stack.Screen name="create_account" />
        <Stack.Screen name="login" />
        <Stack.Screen name="test-auth" />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Post-Login Welcome Screen */}
      <Stack.Screen name="postLoginWelcome" />
      
      {/* Event Management */}
      <Stack.Screen name="eventList" />
      <Stack.Screen name="eventDetail" />
      <Stack.Screen name="bookingConfirmation" />
      <Stack.Screen name="ball" />
      <Stack.Screen name="classes" />
      
      {/* Dance Partners & Matching */}
      <Stack.Screen name="dancePartners" />
      <Stack.Screen name="partnerProfile" />
      <Stack.Screen name="allMatches" />
      
      {/* Feed & Social */}
      <Stack.Screen name="feed" />
      
      {/* Profile & Settings */}
      <Stack.Screen name="profile" />
      <Stack.Screen name="edit_profile" />
      <Stack.Screen name="settings_and_activity" />
      
      {/* Chat System */}
      <Stack.Screen name="chat" />
      <Stack.Screen name="chat_list" />
      
      {/* Video Features */}
      <Stack.Screen name="video_upload" />
      <Stack.Screen name="video_library" />
      <Stack.Screen name="video_detail" />
      <Stack.Screen name="video_debug" />
      
      {/* Premium Features */}
      <Stack.Screen name="paywall" />
      <Stack.Screen name="payment" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}
