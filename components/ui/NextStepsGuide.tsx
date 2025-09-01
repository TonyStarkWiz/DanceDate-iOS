// Next Steps Guide - High Conversion Rate Component
// Appears on every screen to prevent dead ends and guide users forward

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { navigationManager, NavigationPath } from './NavigationManager';

interface NextStepsGuideProps {
  currentScreen: string;
  userInterests?: string[];
  isPremium?: boolean;
  showTitle?: boolean;
  maxSuggestions?: number;
}

export const NextStepsGuide: React.FC<NextStepsGuideProps> = ({
  currentScreen,
  userInterests = [],
  isPremium = false,
  showTitle = true,
  maxSuggestions = 3
}) => {
  const [nextSteps, setNextSteps] = React.useState<NavigationPath[]>([]);

  React.useEffect(() => {
    // Update navigation manager with current context
    navigationManager.updateJourney(currentScreen, userInterests, isPremium);
    
    // Get recommended next steps
    const recommendations = navigationManager.getRecommendedNextScreens(
      currentScreen, 
      userInterests, 
      isPremium
    );
    
    setNextSteps(recommendations.slice(0, maxSuggestions));
  }, [currentScreen, userInterests, isPremium, maxSuggestions]);

  const handleNextStepPress = (path: NavigationPath) => {
    navigationManager.navigateTo(path.screen, {
      userInterests,
      isPremium
    });
  };

  if (nextSteps.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {showTitle && (
        <View style={styles.header}>
          <Ionicons name="arrow-forward" size={20} color="#6A11CB" />
          <Text style={styles.title}>What's Next?</Text>
        </View>
      )}
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {nextSteps.map((step, index) => (
          <TouchableOpacity
            key={`${step.screen}-${index}`}
            style={styles.stepCard}
            onPress={() => handleNextStepPress(step)}
            activeOpacity={0.7}
          >
            <View style={styles.stepIcon}>
              <Ionicons 
                name={step.icon as any} 
                size={24} 
                color={step.isPremium ? "#FFD700" : "#6A11CB"} 
              />
              {step.isPremium && (
                <View style={styles.premiumBadge}>
                  <Ionicons name="diamond" size={12} color="#1a1a2e" />
                </View>
              )}
            </View>
            
            <Text style={styles.stepTitle}>{step.title}</Text>
            <Text style={styles.stepDescription}>{step.description}</Text>
            
            <View style={styles.stepArrow}>
              <Ionicons name="chevron-forward" size={16} color="#6A11CB" />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginLeft: 8,
  },
  scrollContent: {
    paddingRight: 20,
  },
  stepCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderWidth: 1,
    borderColor: 'rgba(106, 17, 203, 0.1)',
  },
  stepIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(106, 17, 203, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  premiumBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FFD700',
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    marginBottom: 8,
  },
  stepArrow: {
    alignSelf: 'flex-end',
  },
});

// Quick Actions Component - For immediate actions
export const QuickActions: React.FC<NextStepsGuideProps> = (props) => {
  return (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.quickActionsTitle}>Quick Actions</Text>
      <NextStepsGuide {...props} showTitle={false} maxSuggestions={2} />
    </View>
  );
};

// Add quick actions styles
const quickActionsStyles = StyleSheet.create({
  quickActionsContainer: {
    marginTop: 10,
  },
  quickActionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a2e',
    marginBottom: 8,
    marginHorizontal: 20,
  },
});

// Merge styles
Object.assign(styles, quickActionsStyles);


