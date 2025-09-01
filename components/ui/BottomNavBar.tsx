// Enhanced Bottom Navigation Bar - High Conversion Rate Navigation
// Prevents dead ends and provides context-aware navigation

import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { usePathname } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { navigationManager } from './NavigationManager';
import { chatService } from '@/services/chatService';

interface NavItem {
  id: string;
  title: string;
  icon: string;
  route: string;
  requiresAuth?: boolean;
  isPremium?: boolean;
  badge?: number;
}

export const BottomNavBar: React.FC = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState('eventList');
  const [isPremium, setIsPremium] = useState(false);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);

  // Navigation items with context awareness
  const navItems: NavItem[] = [
    {
      id: 'eventList',
      title: 'Events',
      icon: 'calendar',
      route: '/eventList',
      badge: 0
    },
    {
      id: 'matching',
      title: 'Partners',
      icon: 'people',
      route: '/matching',
      requiresAuth: true,
      badge: 0
    },
    {
      id: 'matches',
      title: 'Matches',
      icon: 'heart',
      route: '/matches',
      requiresAuth: true,
      badge: 0
    },
    {
      id: 'chat',
      title: 'Chat',
      icon: 'chatbubbles',
      route: '/chat',
      requiresAuth: true,
      badge: unreadMessageCount
    },
    {
      id: 'profile',
      title: 'Profile',
      icon: 'person',
      route: '/profile',
      requiresAuth: true
    }
  ];

  useEffect(() => {
    // Update active tab based on current route
    const currentTab = navItems.find(item => pathname.includes(item.id))?.id || 'eventList';
    setActiveTab(currentTab);
    
    // Check premium status
    checkPremiumStatus();
    
    // Update navigation manager
    updateNavigationContext();
    
    // Load unread message count
    loadUnreadMessageCount();
  }, [pathname, user]);

  // Load unread message count
  const loadUnreadMessageCount = async () => {
    if (!user?.id) {
      setUnreadMessageCount(0);
      return;
    }

    try {
      const count = await chatService.getUnreadCount(user.id);
      setUnreadMessageCount(count);
    } catch (error) {
      console.error('Error loading unread message count:', error);
      setUnreadMessageCount(0);
    }
  };

  const checkPremiumStatus = async () => {
    try {
      if (user?.id) {
        // Check localStorage for premium status (in real app, this would be Firestore)
        const premiumKey = `premium_${user.id}`;
        const isPremiumUser = localStorage.getItem(premiumKey) === 'true';
        setIsPremium(isPremiumUser);
      }
    } catch (error) {
      console.error('Error checking premium status:', error);
    }
  };

  const updateNavigationContext = () => {
    // Get user interests from events they've shown interest in
    const userInterests: string[] = [];
    if (user?.id) {
      // In a real app, you'd fetch this from Firestore
      // For now, we'll use a placeholder
      userInterests.push('salsa', 'bachata', 'ballroom');
    }
    
    // Update navigation manager with current context
    navigationManager.updateJourney(activeTab, userInterests, isPremium);
  };

  const handleTabPress = (item: NavItem) => {
    try {
      // Check authentication requirements
      if (item.requiresAuth && !user) {
        showAuthRequiredAlert(item);
        return;
      }

      // Check premium requirements
      if (item.isPremium && !isPremium) {
        showPremiumRequiredAlert(item);
        return;
      }

      // Navigate with context
      navigationManager.navigateTo(item.id, {
        userInterests: ['salsa', 'bachata', 'ballroom'], // Would be fetched from user data
        isPremium,
        showRecommendations: false
      });

      setActiveTab(item.id);
      
    } catch (error) {
      console.error('Navigation error:', error);
      showFallbackNavigation();
    }
  };

  const showAuthRequiredAlert = (item: NavItem) => {
    Alert.alert(
      'Sign In Required',
      `Please sign in to access ${item.title.toLowerCase()}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign In', 
          onPress: () => navigationManager.navigateTo('signin', { showRecommendations: true })
        }
      ]
    );
  };

  const showPremiumRequiredAlert = (item: NavItem) => {
    Alert.alert(
      'Premium Feature',
      `${item.title} is a premium feature. Upgrade to access it.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Upgrade', 
          onPress: () => navigationManager.navigateTo('premiumUpgrade', { showRecommendations: true })
        }
      ]
    );
  };

  const showFallbackNavigation = () => {
    Alert.alert(
      'Navigation Issue',
      'Let\'s get you back on track:',
      [
        { text: 'Find Events', onPress: () => navigationManager.navigateTo('eventList') },
        { text: 'Sign In', onPress: () => navigationManager.navigateTo('signin') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const getNextRecommendedAction = () => {
    const nextAction = navigationManager.suggestNextAction();
    if (nextAction) {
      return nextAction;
    }
    
    // Fallback to default actions
    if (!user) {
      return { screen: 'signin', title: 'Sign In', description: 'Join the community' };
    }
    
    if (!isPremium) {
      return { screen: 'premiumUpgrade', title: 'Go Premium', description: 'Unlock all features' };
    }
    
    return { screen: 'matching', title: 'Find Partners', description: 'Connect with dancers' };
  };

  return (
    <View style={styles.container}>
      {/* Main Navigation Tabs */}
      <View style={styles.navContainer}>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isDisabled = (item.requiresAuth && !user) || (item.isPremium && !isPremium);
          
          return (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.navItem,
                isActive && styles.navItemActive,
                isDisabled && styles.navItemDisabled
              ]}
              onPress={() => handleTabPress(item)}
              disabled={isDisabled}
            >
              <View style={styles.navIconContainer}>
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={isActive ? '#fff' : isDisabled ? '#ccc' : '#6A11CB'}
                />
                {item.badge && item.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}
                {item.isPremium && !isPremium && (
                  <View style={styles.premiumIndicator}>
                    <Ionicons name="diamond" size={12} color="#FFD700" />
                  </View>
                )}
              </View>
              <Text style={[
                styles.navText,
                isActive && styles.navTextActive,
                isDisabled && styles.navTextDisabled
              ]}>
                {item.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Quick Action Suggestion */}
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => {
          const nextAction = getNextRecommendedAction();
          navigationManager.navigateTo(nextAction.screen, { showRecommendations: true });
        }}
      >
        <Ionicons name="flash" size={20} color="#fff" />
        <Text style={styles.quickActionText}>Quick Action</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    paddingBottom: 20,
    paddingTop: 10,
  },
  navContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    minWidth: 60,
  },
  navItemActive: {
    backgroundColor: '#6A11CB',
  },
  navItemDisabled: {
    opacity: 0.5,
  },
  navIconContainer: {
    position: 'relative',
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6A11CB',
    textAlign: 'center',
  },
  navTextActive: {
    color: '#fff',
  },
  navTextDisabled: {
    color: '#ccc',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF6B6B',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  premiumIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#6A11CB',
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
});
