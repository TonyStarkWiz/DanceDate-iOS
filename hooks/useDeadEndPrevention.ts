// Dead End Prevention Hook - High Conversion Rate User Experience
// Monitors user behavior and prevents dead ends by suggesting next actions

import { navigationManager } from '@/components/ui/NavigationManager';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

interface DeadEndPreventionOptions {
  currentScreen: string;
  userInterests?: string[];
  isPremium?: boolean;
  inactivityThreshold?: number; // milliseconds
  enableAutoSuggestions?: boolean;
}

export const useDeadEndPrevention = (options: DeadEndPreventionOptions) => {
  const { user } = useAuth();
  const [isUserStuck, setIsUserStuck] = useState(false);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);

  const {
    currentScreen,
    userInterests = [],
    isPremium = false,
    inactivityThreshold = 120000, // 2 minutes
    enableAutoSuggestions = true
  } = options;

  // Update last activity on any user interaction
  const updateActivity = () => {
    setLastActivity(Date.now());
    setIsUserStuck(false);
    
    // Clear existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    // Set new timer
    inactivityTimerRef.current = setTimeout(() => {
      setIsUserStuck(true);
      if (enableAutoSuggestions) {
        suggestNextAction();
      }
    }, inactivityThreshold);
  };

  // Suggest next action when user is stuck
  const suggestNextAction = () => {
    console.log('🧪 DeadEndPrevention: User appears stuck, suggesting next action');
    
    const nextAction = navigationManager.suggestNextAction();
    if (nextAction) {
      // Show suggestion after a brief delay to avoid being intrusive
      setTimeout(() => {
        navigationManager.handleDeadEnd(currentScreen, userInterests, isPremium);
      }, 1000);
    }
  };

  // Handle app state changes
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
      // App came to foreground, update activity
      updateActivity();
    }
    appStateRef.current = nextAppState;
  };

  // Monitor user interactions
  useEffect(() => {
    const handleUserInteraction = () => {
      updateActivity();
    };

    // Add event listeners for user interactions
    const events = ['touchstart', 'scroll', 'focus'];
    
    if (typeof document !== 'undefined') {
      events.forEach(event => {
        document.addEventListener(event, handleUserInteraction, { passive: true });
      });
    }

    // Monitor app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Initial activity update
    updateActivity();

    // Cleanup
    return () => {
      if (typeof document !== 'undefined') {
        events.forEach(event => {
          document.removeEventListener(event, handleUserInteraction);
        });
      }
      
      subscription?.remove();
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [currentScreen, userInterests, isPremium]);

  // Update navigation context when dependencies change
  useEffect(() => {
    navigationManager.updateJourney(currentScreen, userInterests, isPremium);
  }, [currentScreen, userInterests, isPremium]);

  // Check if user should see premium upgrade suggestion
  const shouldSuggestPremiumUpgrade = () => {
    return !isPremium && user && currentScreen !== 'premiumUpgrade';
  };

  // Check if user should see authentication suggestion
  const shouldSuggestAuthentication = () => {
    return !user && currentScreen !== 'signin' && currentScreen !== 'createAccount';
  };

  // Get contextual suggestions based on current state
  const getContextualSuggestions = () => {
    const suggestions = [];

    if (shouldSuggestAuthentication()) {
      suggestions.push({
        action: 'signin',
        title: 'Sign In',
        description: 'Access your account and matches',
        priority: 'high'
      });
    }

    if (shouldSuggestPremiumUpgrade()) {
      suggestions.push({
        action: 'premiumUpgrade',
        title: 'Go Premium',
        description: 'Unlock unlimited searches and features',
        priority: 'medium'
      });
    }

    // Add screen-specific suggestions
    switch (currentScreen) {
      case 'eventList':
        if (user) {
          suggestions.push({
            action: 'matching',
            title: 'Find Partners',
            description: 'Connect with event attendees',
            priority: 'high'
          });
        }
        break;
        
      case 'matching':
        if (user) {
          suggestions.push({
            action: 'matches',
            title: 'View Matches',
            description: 'See who you\'ve connected with',
            priority: 'high'
          });
        }
        break;
        
      case 'matches':
        if (user) {
          suggestions.push({
            action: 'chat',
            title: 'Start Chatting',
            description: 'Message your matches',
            priority: 'high'
          });
        }
        break;
    }

    return suggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority as keyof typeof priorityOrder] - priorityOrder[a.priority as keyof typeof priorityOrder];
    });
  };

  // Force suggest next action (for manual triggers)
  const forceSuggestNextAction = () => {
    const suggestions = getContextualSuggestions();
    if (suggestions.length > 0) {
      const topSuggestion = suggestions[0];
      navigationManager.navigateTo(topSuggestion.action, {
        userInterests,
        isPremium,
        showRecommendations: true
      });
    } else {
      navigationManager.handleDeadEnd(currentScreen, userInterests, isPremium);
    }
  };

  return {
    isUserStuck,
    lastActivity,
    updateActivity,
    suggestNextAction,
    getContextualSuggestions,
    forceSuggestNextAction,
    shouldSuggestPremiumUpgrade: shouldSuggestPremiumUpgrade(),
    shouldSuggestAuthentication: shouldSuggestAuthentication()
  };
};


