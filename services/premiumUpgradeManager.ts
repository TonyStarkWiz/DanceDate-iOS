// Premium Upgrade Manager - High Conversion Rate Service
// Manages premium upgrade popup triggers and timing for maximum conversion

export interface UpgradeTrigger {
  type: 'usage_limit' | 'feature_access' | 'promotional' | 'timer' | 'exit_intent';
  priority: 'high' | 'medium' | 'low';
  conditions: {
    userLoggedIn?: boolean;
    isPremium?: boolean;
    usageCount?: number;
    timeOnSite?: number;
    pageViews?: number;
  };
  timing: {
    delay?: number; // seconds
    frequency?: 'once' | 'daily' | 'weekly' | 'always';
    maxShows?: number;
  };
}

export interface UpgradeSession {
  userId?: string;
  triggerType: string;
  timestamp: number;
  dismissed: boolean;
  converted: boolean;
}

export class PremiumUpgradeManager {
  private static instance: PremiumUpgradeManager;
  private sessions: Map<string, UpgradeSession[]> = new Map();
  private lastShown: Map<string, number> = new Map();
  private dismissCount: Map<string, number> = new Map();

  static getInstance(): PremiumUpgradeManager {
    if (!PremiumUpgradeManager.instance) {
      PremiumUpgradeManager.instance = new PremiumUpgradeManager();
    }
    return PremiumUpgradeManager.instance;
  }

  // Define upgrade triggers with high conversion optimization
  private upgradeTriggers: UpgradeTrigger[] = [
    // High Priority - Usage Limit Reached
    {
      type: 'usage_limit',
      priority: 'high',
      conditions: {
        userLoggedIn: true,
        isPremium: false,
        usageCount: 5, // After 5 searches
      },
      timing: {
        delay: 0,
        frequency: 'once',
        maxShows: 3,
      },
    },

    // High Priority - Feature Access Attempt
    {
      type: 'feature_access',
      priority: 'high',
      conditions: {
        userLoggedIn: true,
        isPremium: false,
      },
      timing: {
        delay: 2,
        frequency: 'daily',
        maxShows: 5,
      },
    },

    // Medium Priority - Promotional Timer
    {
      type: 'promotional',
      priority: 'medium',
      conditions: {
        userLoggedIn: true,
        isPremium: false,
        timeOnSite: 120, // 2 minutes
      },
      timing: {
        delay: 0,
        frequency: 'daily',
        maxShows: 2,
      },
    },

    // Medium Priority - Exit Intent
    {
      type: 'exit_intent',
      priority: 'medium',
      conditions: {
        userLoggedIn: true,
        isPremium: false,
        timeOnSite: 60, // 1 minute minimum
      },
      timing: {
        delay: 0,
        frequency: 'once',
        maxShows: 1,
      },
    },

    // Low Priority - General Timer
    {
      type: 'timer',
      priority: 'low',
      conditions: {
        userLoggedIn: true,
        isPremium: false,
        timeOnSite: 300, // 5 minutes
      },
      timing: {
        delay: 0,
        frequency: 'weekly',
        maxShows: 3,
      },
    },
  ];

  // Check if upgrade popup should be shown
  shouldShowUpgrade(
    userId: string | undefined,
    isPremium: boolean,
    currentUsage: number,
    timeOnSite: number,
    pageViews: number
  ): { shouldShow: boolean; triggerType: string; countdownSeconds: number } {
    console.log('🧪 Premium upgrade check:', {
      userId,
      isPremium,
      currentUsage,
      timeOnSite,
      pageViews
    });

    // Don't show if user is already premium
    if (isPremium) {
      console.log('🧪 User is premium, not showing popup');
      return { shouldShow: false, triggerType: '', countdownSeconds: 0 };
    }

    // Don't show if user is not logged in (except for promotional)
    if (!userId) {
      console.log('🧪 User not logged in, not showing popup');
      return { shouldShow: false, triggerType: '', countdownSeconds: 0 };
    }

    // Check each trigger in priority order
    for (const trigger of this.upgradeTriggers) {
      console.log('🧪 Checking trigger:', trigger.type);
      if (this.evaluateTrigger(trigger, userId, isPremium, currentUsage, timeOnSite, pageViews)) {
        console.log('🧪 Trigger conditions met:', trigger.type);
        const shouldShow = this.canShowTrigger(trigger, userId);
        if (shouldShow) {
          console.log('🧪 Trigger can show:', trigger.type);
          return {
            shouldShow: true,
            triggerType: trigger.type,
            countdownSeconds: this.getCountdownForTrigger(trigger.type),
          };
        } else {
          console.log('🧪 Trigger cannot show:', trigger.type);
        }
      } else {
        console.log('🧪 Trigger conditions not met:', trigger.type);
      }
    }

    console.log('🧪 No triggers can show popup');
    return { shouldShow: false, triggerType: '', countdownSeconds: 0 };
  }

  // Evaluate if a trigger's conditions are met
  private evaluateTrigger(
    trigger: UpgradeTrigger,
    userId: string | undefined,
    isPremium: boolean,
    currentUsage: number,
    timeOnSite: number,
    pageViews: number
  ): boolean {
    const { conditions } = trigger;

    console.log('🧪 Evaluating trigger conditions:', {
      triggerType: trigger.type,
      conditions,
      userId: !!userId,
      isPremium,
      currentUsage,
      timeOnSite,
      pageViews
    });

    if (conditions.userLoggedIn && !userId) {
      console.log('🧪 User not logged in, condition failed');
      return false;
    }
    if (conditions.isPremium !== undefined && conditions.isPremium !== isPremium) {
      console.log('🧪 Premium condition failed:', conditions.isPremium, 'vs', isPremium);
      return false;
    }
    if (conditions.usageCount && currentUsage < conditions.usageCount) {
      console.log('🧪 Usage count condition failed:', currentUsage, '<', conditions.usageCount);
      return false;
    }
    if (conditions.timeOnSite && timeOnSite < conditions.timeOnSite) {
      console.log('🧪 Time on site condition failed:', timeOnSite, '<', conditions.timeOnSite);
      return false;
    }
    if (conditions.pageViews && pageViews < conditions.pageViews) {
      console.log('🧪 Page views condition failed:', pageViews, '<', conditions.pageViews);
      return false;
    }

    console.log('🧪 All trigger conditions met');
    return true;
  }

  // Check if trigger can be shown based on timing rules
  private canShowTrigger(trigger: UpgradeTrigger, userId: string): boolean {
    const userSessions = this.sessions.get(userId) || [];
    const triggerSessions = userSessions.filter(s => s.triggerType === trigger.type);
    const lastShownTime = this.lastShown.get(`${userId}_${trigger.type}`) || 0;
    const dismissCount = this.dismissCount.get(`${userId}_${trigger.type}`) || 0;

    // For testing, allow more frequent shows
    console.log('🧪 Premium trigger check:', {
      triggerType: trigger.type,
      sessions: triggerSessions.length,
      maxShows: trigger.timing.maxShows,
      lastShown: lastShownTime,
      frequency: trigger.timing.frequency
    });

    // Check max shows limit
    if (trigger.timing.maxShows && triggerSessions.length >= trigger.timing.maxShows) {
      console.log('🧪 Max shows reached for trigger:', trigger.type);
      return false;
    }

    // Check frequency limits
    const now = Date.now();
    switch (trigger.timing.frequency) {
      case 'once':
        const canShow = triggerSessions.length === 0;
        console.log('🧪 Once trigger can show:', canShow);
        return canShow;
      case 'daily':
        const oneDayAgo = now - (24 * 60 * 60 * 1000);
        const dailyCanShow = lastShownTime < oneDayAgo;
        console.log('🧪 Daily trigger can show:', dailyCanShow);
        return dailyCanShow;
      case 'weekly':
        const oneWeekAgo = now - (7 * 24 * 60 * 60 * 1000);
        const weeklyCanShow = lastShownTime < oneWeekAgo;
        console.log('🧪 Weekly trigger can show:', weeklyCanShow);
        return weeklyCanShow;
      case 'always':
        console.log('🧪 Always trigger can show: true');
        return true;
      default:
        console.log('🧪 Default trigger can show: true');
        return true;
    }
  }

  // Get countdown seconds for different trigger types
  private getCountdownForTrigger(triggerType: string): number {
    switch (triggerType) {
      case 'usage_limit':
        return 300; // 5 minutes - high urgency
      case 'feature_access':
        return 180; // 3 minutes - medium urgency
      case 'promotional':
        return 600; // 10 minutes - promotional urgency
      case 'exit_intent':
        return 120; // 2 minutes - exit urgency
      case 'timer':
        return 480; // 8 minutes - general urgency
      default:
        return 300; // 5 minutes default
    }
  }

  // Record popup shown
  recordPopupShown(userId: string, triggerType: string): void {
    const session: UpgradeSession = {
      userId,
      triggerType,
      timestamp: Date.now(),
      dismissed: false,
      converted: false,
    };

    const userSessions = this.sessions.get(userId) || [];
    userSessions.push(session);
    this.sessions.set(userId, userSessions);

    this.lastShown.set(`${userId}_${triggerType}`, Date.now());
  }

  // Record popup dismissed
  recordPopupDismissed(userId: string, triggerType: string): void {
    const userSessions = this.sessions.get(userId) || [];
    const lastSession = userSessions[userSessions.length - 1];
    
    if (lastSession && lastSession.triggerType === triggerType) {
      lastSession.dismissed = true;
    }

    const dismissCount = this.dismissCount.get(`${userId}_${triggerType}`) || 0;
    this.dismissCount.set(`${userId}_${triggerType}`, dismissCount + 1);
  }

  // Record conversion
  recordConversion(userId: string, triggerType: string): void {
    const userSessions = this.sessions.get(userId) || [];
    const lastSession = userSessions[userSessions.length - 1];
    
    if (lastSession && lastSession.triggerType === triggerType) {
      lastSession.converted = true;
    }
  }

  // Get conversion analytics
  getConversionAnalytics(): {
    totalShows: number;
    totalDismissals: number;
    totalConversions: number;
    conversionRate: number;
    triggerTypeStats: Record<string, { shows: number; conversions: number; rate: number }>;
  } {
    let totalShows = 0;
    let totalDismissals = 0;
    let totalConversions = 0;
    const triggerTypeStats: Record<string, { shows: number; conversions: number; rate: number }> = {};

    for (const userSessions of this.sessions.values()) {
      for (const session of userSessions) {
        totalShows++;
        if (session.dismissed) totalDismissals++;
        if (session.converted) totalConversions++;

        if (!triggerTypeStats[session.triggerType]) {
          triggerTypeStats[session.triggerType] = { shows: 0, conversions: 0, rate: 0 };
        }
        triggerTypeStats[session.triggerType].shows++;
        if (session.converted) {
          triggerTypeStats[session.triggerType].conversions++;
        }
      }
    }

    // Calculate rates
    const conversionRate = totalShows > 0 ? (totalConversions / totalShows) * 100 : 0;
    
    for (const stats of Object.values(triggerTypeStats)) {
      stats.rate = stats.shows > 0 ? (stats.conversions / stats.shows) * 100 : 0;
    }

    return {
      totalShows,
      totalDismissals,
      totalConversions,
      conversionRate,
      triggerTypeStats,
    };
  }

  // Reset user data (for testing or GDPR compliance)
  resetUserData(userId: string): void {
    this.sessions.delete(userId);
    this.lastShown.delete(userId);
    this.dismissCount.delete(userId);
  }

  // Get optimal trigger timing based on user behavior
  getOptimalTriggerTiming(userId: string): { triggerType: string; delay: number } {
    const userSessions = this.sessions.get(userId) || [];
    const dismissCount = this.dismissCount.get(userId) || 0;

    // If user has dismissed multiple times, use longer delays
    if (dismissCount > 3) {
      return { triggerType: 'timer', delay: 600 }; // 10 minutes
    } else if (dismissCount > 1) {
      return { triggerType: 'promotional', delay: 300 }; // 5 minutes
    } else {
      return { triggerType: 'usage_limit', delay: 0 }; // Immediate
    }
  }

  // Check if user is in a "hot" state (likely to convert)
  isUserHot(userId: string): boolean {
    const userSessions = this.sessions.get(userId) || [];
    const recentSessions = userSessions.filter(
      s => Date.now() - s.timestamp < 24 * 60 * 60 * 1000 // Last 24 hours
    );

    // User is "hot" if they've seen the popup multiple times recently
    return recentSessions.length >= 2;
  }
}

// Export singleton instance
export const premiumUpgradeManager = PremiumUpgradeManager.getInstance();
