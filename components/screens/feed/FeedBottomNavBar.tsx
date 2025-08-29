import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native';

interface FeedBottomNavBarProps {
  selectedIndex?: number;
  onIndexChange?: (index: number) => void;
}

export const FeedBottomNavBar: React.FC<FeedBottomNavBarProps> = ({ 
  selectedIndex = 0, 
  onIndexChange 
}) => {
  const [selectedTab, setSelectedTab] = useState(selectedIndex);

  const handleTabPress = (index: number) => {
    setSelectedTab(index);
    onIndexChange?.(index);

    switch (index) {
      case 0: // Events
        router.push('/eventList');
        break;
      case 1: // Search
        Alert.alert('Under Construction', 'Search is under construction');
        break;
      case 2: // Post
        Alert.alert('Under Construction', 'Post is under construction');
        break;
      case 3: // Reels
        Alert.alert('Under Construction', 'Reels is under construction');
        break;
      case 4: // Profile
        router.push('/profile');
        break;
    }
  };

  const renderTab = (index: number, iconName: keyof typeof Ionicons.glyphMap, label: string) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.tabItem,
        selectedTab === index && styles.selectedTab
      ]}
      onPress={() => handleTabPress(index)}
    >
      <Ionicons
        name={iconName}
        size={24}
        color={selectedTab === index ? '#4A148C' : '#666'}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {renderTab(0, 'calendar', 'Events')}
      {renderTab(1, 'search', 'Search')}
      {renderTab(2, 'add-circle', 'Post')}
      {renderTab(3, 'play-circle', 'Reels')}
      {renderTab(4, 'person', 'Profile')}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectedTab: {
    backgroundColor: 'rgba(74, 20, 140, 0.1)', // Purple with transparency
  },
});

export default FeedBottomNavBar;
