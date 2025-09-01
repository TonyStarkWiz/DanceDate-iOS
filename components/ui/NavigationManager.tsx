// Navigation Manager - High Conversion Rate Navigation System
// Ensures users never reach dead ends and always have clear paths forward

import { router } from 'expo-router';
import { Alert } from 'react-native';

export interface NavigationPath {
  screen: string;
  title: string;
  description: string;
  icon: string;
  isActive: boolean;
  requiresAuth?: boolean;
  isPremium?: boolean;
}

export interface UserJourney {
  currentScreen: string;
  previousScreens: string[];
  nextRecommendedScreens: NavigationPath[];
  userInterests: string[];
  isPremium: boolean;
}

export class NavigationManager {
  private static instance: NavigationManager;
  private userJourney: UserJourney = {
    currentScreen: '',
    previousScreens: [],
    nextRecommendedScreens: [],
    userInterests: [],
    isPremium: false
  };

  static getInstance(): NavigationManager {
    if (!NavigationManager.instance) {
      NavigationManager.instance = new NavigationManager();
    }
    return NavigationManager.instance;
  }

  // Update user journey when navigating
  updateJourney(screen: string, userInterests: string[] = [], isPremium: boolean = false) {
    if (this.userJourney.currentScreen && this.userJourney.currentScreen !== screen) {
      this.userJourney.previousScreens.push(this.userJourney.currentScreen);
    }
    
    this.userJourney.currentScreen = screen;
    this.userJourney.userInterests = userInterests;
    this.userJourney.isPremium = isPremium;
    this.userJourney.nextRecommendedScreens = this.getRecommendedNextScreens(screen, userInterests, isPremium);
    
    console.log('🧪 NavigationManager: Updated journey for screen:', screen);
  }

  // Get recommended next screens based on current context
  getRecommendedNextScreens(screen: string, userInterests: string[] = [], isPremium: boolean = false): NavigationPath[] {
    const allPaths = this.getAllNavigationPaths();
    
    switch (screen) {
      case 'entry':
        return [
          { screen: 'signin', title: 'Sign In', description: 'Access your account', icon: 'log-in', isActive: true },
          { screen: 'createAccount', title: 'Create Account', description: 'Join the community', icon: 'person-add', isActive: true },
          { screen: 'eventList', title: 'Browse Events', description: 'See what\'s happening', icon: 'calendar', isActive: true }
        ];
        
      case 'signin':
        return [
          { screen: 'eventList', title: 'Find Events', description: 'Discover dance events', icon: 'search', isActive: true },
          { screen: 'matching', title: 'Find Partners', description: 'Connect with dancers', icon: 'people', isActive: true },
          { screen: 'profile', title: 'Your Profile', description: 'Manage your account', icon: 'person', isActive: true, requiresAuth: true }
        ];
        
      case 'eventList':
        return [
          { screen: 'matching', title: 'Find Partners', description: 'Connect with event attendees', icon: 'people', isActive: true },
          { screen: 'matches', title: 'Your Matches', description: 'See who you\'ve matched with', icon: 'heart', isActive: true, requiresAuth: true },
          { screen: 'profile', title: 'Your Profile', description: 'Update your preferences', icon: 'person', isActive: true, requiresAuth: true },
          { screen: 'premiumUpgrade', title: 'Go Premium', description: 'Unlimited searches & features', icon: 'diamond', isActive: true, isPremium: true }
        ];
        
      case 'matching':
        return [
          { screen: 'matches', title: 'View Matches', description: 'See your connections', icon: 'heart', isActive: true, requiresAuth: true },
          { screen: 'eventList', title: 'Find Events', description: 'Discover more events', icon: 'calendar', isActive: true },
          { screen: 'chat', title: 'Start Chatting', description: 'Message your matches', icon: 'chatbubbles', isActive: true, requiresAuth: true },
          { screen: 'profile', title: 'Update Profile', description: 'Improve your matches', icon: 'person', isActive: true, requiresAuth: true }
        ];
        
      case 'matches':
        return [
          { screen: 'chat', title: 'Start Chatting', description: 'Message your matches', icon: 'chatbubbles', isActive: true, requiresAuth: true },
          { screen: 'matching', title: 'Find More', description: 'Discover new partners', icon: 'people', isActive: true },
          { screen: 'eventList', title: 'Find Events', description: 'Attend events together', icon: 'calendar', isActive: true },
          { screen: 'profile', title: 'Your Profile', description: 'Update your preferences', icon: 'person', isActive: true, requiresAuth: true }
        ];
        
      case 'chat':
        return [
          { screen: 'matches', title: 'All Matches', description: 'View all your connections', icon: 'heart', isActive: true, requiresAuth: true },
          { screen: 'matching', title: 'Find More', description: 'Discover new partners', icon: 'people', isActive: true },
          { screen: 'eventList', title: 'Plan Together', description: 'Find events to attend', icon: 'calendar', isActive: true },
          { screen: 'profile', title: 'Your Profile', description: 'Manage your account', icon: 'person', isActive: true, requiresAuth: true }
        ];
        
      case 'profile':
        return [
          { screen: 'eventList', title: 'Find Events', description: 'Discover dance events', icon: 'calendar', isActive: true },
          { screen: 'matching', title: 'Find Partners', description: 'Connect with dancers', icon: 'people', isActive: true },
          { screen: 'matches', title: 'Your Matches', description: 'See your connections', icon: 'heart', isActive: true, requiresAuth: true },
          { screen: 'premiumUpgrade', title: 'Go Premium', description: 'Unlock all features', icon: 'diamond', isActive: true, isPremium: true }
        ];
        
      case 'premiumUpgrade':
        return [
          { screen: 'eventList', title: 'Premium Events', description: 'Access unlimited searches', icon: 'search', isActive: true },
          { screen: 'matching', title: 'Premium Matching', description: 'Advanced partner discovery', icon: 'people', isActive: true },
          { screen: 'profile', title: 'Your Profile', description: 'Manage premium features', icon: 'person', isActive: true, requiresAuth: true }
        ];
        
      default:
        return [
          { screen: 'eventList', title: 'Find Events', description: 'Discover dance events', icon: 'calendar', isActive: true },
          { screen: 'matching', title: 'Find Partners', description: 'Connect with dancers', icon: 'people', isActive: true },
          { screen: 'profile', title: 'Your Profile', description: 'Manage your account', icon: 'person', isActive: true, requiresAuth: true }
        ];
    }
  }

  // Navigate with context awareness
  navigateTo(screen: string, options?: { 
    userInterests?: string[], 
    isPremium?: boolean, 
    showRecommendations?: boolean 
  }) {
    try {
      console.log('🧪 NavigationManager: Navigating to:', screen);
      
      // Update journey before navigation
      this.updateJourney(screen, options?.userInterests, options?.isPremium);
      
      // Navigate to screen
      router.push(`/${screen}`);
      
      // Show recommendations if requested
      if (options?.showRecommendations) {
        this.showNextStepsRecommendation();
      }
      
    } catch (error) {
      console.error('🧪 NavigationManager: Navigation error:', error);
      this.showFallbackNavigation();
    }
  }

  // Show next steps recommendation
  showNextStepsRecommendation() {
    const recommendations = this.userJourney.nextRecommendedScreens;
    
    if (recommendations.length > 0) {
      Alert.alert(
        'What would you like to do next?',
        'Choose your next step to continue your dance journey:',
        [
          ...recommendations.slice(0, 3).map(path => ({
            text: path.title,
            onPress: () => this.navigateTo(path.screen)
          })),
          { text: 'Maybe Later', style: 'cancel' }
        ]
      );
    }
  }

  // Handle dead end scenarios
  handleDeadEnd(currentScreen: string, userInterests: string[] = [], isPremium: boolean = false) {
    console.log('🧪 NavigationManager: Handling potential dead end on:', currentScreen);
    
    const recommendations = this.getRecommendedNextScreens(currentScreen, userInterests, isPremium);
    
    if (recommendations.length > 0) {
      Alert.alert(
        'Keep the Dance Going! 💃',
        'Here are some great next steps to continue your dance journey:',
        [
          ...recommendations.slice(0, 3).map(path => ({
            text: `${path.title} - ${path.description}`,
            onPress: () => this.navigateTo(path.screen)
          })),
          { text: 'Stay Here', style: 'cancel' }
        ]
      );
    } else {
      this.showFallbackNavigation();
    }
  }

  // Fallback navigation when all else fails
  showFallbackNavigation() {
    Alert.alert(
      'Let\'s Get You Moving! 🎵',
      'Choose where you\'d like to go:',
      [
        { text: 'Find Events', onPress: () => this.navigateTo('eventList') },
        { text: 'Find Partners', onPress: () => this.navigateTo('matching') },
        { text: 'Your Profile', onPress: () => this.navigateTo('profile') },
        { text: 'Go Home', onPress: () => this.navigateTo('entry') }
      ]
    );
  }

  // Get all available navigation paths
  getAllNavigationPaths(): NavigationPath[] {
    return [
      { screen: 'entry', title: 'Home', description: 'Welcome to DanceLink', icon: 'home', isActive: true },
      { screen: 'signin', title: 'Sign In', description: 'Access your account', icon: 'log-in', isActive: true },
      { screen: 'createAccount', title: 'Create Account', description: 'Join the community', icon: 'person-add', isActive: true },
      { screen: 'eventList', title: 'Find Events', description: 'Discover dance events', icon: 'calendar', isActive: true },
      { screen: 'matching', title: 'Find Partners', description: 'Connect with dancers', icon: 'people', isActive: true },
      { screen: 'matches', title: 'Your Matches', description: 'See your connections', icon: 'heart', isActive: true, requiresAuth: true },
      { screen: 'chat', title: 'Chat', description: 'Message your matches', icon: 'chatbubbles', isActive: true, requiresAuth: true },
      { screen: 'profile', title: 'Profile', description: 'Manage your account', icon: 'person', isActive: true, requiresAuth: true },
      { screen: 'premiumUpgrade', title: 'Premium', description: 'Unlock all features', icon: 'diamond', isActive: true, isPremium: true },
      { screen: 'settings', title: 'Settings', description: 'App preferences', icon: 'settings', isActive: true, requiresAuth: true }
    ];
  }

  // Get user journey analytics
  getUserJourney(): UserJourney {
    return this.userJourney;
  }

  // Check if user is stuck (same screen for too long)
  isUserStuck(): boolean {
    const currentTime = Date.now();
    const lastNavigationTime = this.userJourney.lastNavigationTime || 0;
    const timeSinceLastNavigation = currentTime - lastNavigationTime;
    
    // Consider user stuck if they've been on the same screen for more than 2 minutes
    return timeSinceLastNavigation > 120000; // 2 minutes
  }

  // Suggest next action based on user behavior
  suggestNextAction(): NavigationPath | null {
    const recommendations = this.userJourney.nextRecommendedScreens;
    
    if (recommendations.length > 0) {
      // Prioritize based on user interests and premium status
      const priorityRecommendations = recommendations.sort((a, b) => {
        // Premium features first for premium users
        if (this.userJourney.isPremium && a.isPremium && !b.isPremium) return -1;
        if (this.userJourney.isPremium && !a.isPremium && b.isPremium) return 1;
        
        // Auth-required features for authenticated users
        if (a.requiresAuth && !b.requiresAuth) return -1;
        if (!a.requiresAuth && b.requiresAuth) return 1;
        
        return 0;
      });
      
      return priorityRecommendations[0];
    }
    
    return null;
  }

  // Reset journey (for logout or app restart)
  resetJourney() {
    this.userJourney = {
      currentScreen: '',
      previousScreens: [],
      nextRecommendedScreens: [],
      userInterests: [],
      isPremium: false
    };
    console.log('🧪 NavigationManager: Journey reset');
  }
}

// Export singleton instance
export const navigationManager = NavigationManager.getInstance();


