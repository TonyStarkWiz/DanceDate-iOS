import { ChatScreen } from '@/components/screens/ChatScreen';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';

export default function ChatRoute() {
  const { partnerId } = useLocalSearchParams<{ partnerId: string }>();
  
  return <ChatScreen partnerId={partnerId} />;
}


