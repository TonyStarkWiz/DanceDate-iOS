import { EventListScreen } from '@/components/screens/EventListScreen';
import React from 'react';
import { Alert } from 'react-native';

export default function EventListRoute() {
  Alert.alert('🧪 EventListRoute', 'Route component is rendering!');
  return <EventListScreen />;
}
