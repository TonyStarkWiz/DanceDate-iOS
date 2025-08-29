import { getFunctions, httpsCallable, Functions } from 'firebase/functions';
import { auth } from '@/config/firebase';

// Cloud Functions Service (matches Android FirebaseFunctions implementation)
export class CloudFunctionsService {
  private static instance: CloudFunctionsService;
  private functions: Functions;

  private constructor() {
    this.functions = getFunctions();
  }

  public static getInstance(): CloudFunctionsService {
    if (!CloudFunctionsService.instance) {
      CloudFunctionsService.instance = new CloudFunctionsService();
    }
    return CloudFunctionsService.instance;
  }

  // Update user profile via Cloud Functions (matches Android implementation)
  public async updateUserProfile(userData: {
    uid: string;
    displayName?: string;
    email?: string;
    photoURL?: string;
    [key: string]: any;
  }): Promise<any> {
    try {
      const updateUserProfileFunction = httpsCallable(
        this.functions,
        'updateUserProfile'
      );

      const result = await updateUserProfileFunction(userData);
      console.log('🧪 User profile updated via Cloud Functions:', result);
      
      return result.data;
    } catch (error) {
      console.error('🧪 Error updating user profile via Cloud Functions:', error);
      throw error;
    }
  }

  // Create or update user in Firestore (matches Android implementation)
  public async createOrUpdateUser(firebaseUser: any): Promise<any> {
    try {
      const createOrUpdateUserFunction = httpsCallable(
        this.functions,
        'createOrUpdateUser'
      );

      const userData = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        metadata: {
          creationTime: firebaseUser.metadata?.creationTime,
          lastSignInTime: firebaseUser.metadata?.lastSignInTime,
        },
      };

      const result = await createOrUpdateUserFunction(userData);
      console.log('🧪 User created/updated via Cloud Functions:', result);
      
      return result.data;
    } catch (error) {
      console.error('🧪 Error creating/updating user via Cloud Functions:', error);
      throw error;
    }
  }

  // Preload events for user (matches Android EventSeeder.preloadEventsIfNeeded)
  public async preloadEventsIfNeeded(userId: string): Promise<any> {
    try {
      const preloadEventsFunction = httpsCallable(
        this.functions,
        'preloadEventsIfNeeded'
      );

      const result = await preloadEventsFunction({ userId });
      console.log('🧪 Events preloaded via Cloud Functions:', result);
      
      return result.data;
    } catch (error) {
      console.error('🧪 Error preloading events via Cloud Functions:', error);
      throw error;
    }
  }

  // Get user recommendations (AI-powered matching)
  public async getUserRecommendations(userId: string, preferences: any): Promise<any> {
    try {
      const getRecommendationsFunction = httpsCallable(
        this.functions,
        'getUserRecommendations'
      );

      const result = await getRecommendationsFunction({
        userId,
        preferences,
      });
      
      console.log('🧪 User recommendations received via Cloud Functions:', result);
      return result.data;
    } catch (error) {
      console.error('🧪 Error getting user recommendations via Cloud Functions:', error);
      throw error;
    }
  }

  // AI-powered event search (matches Android AI search features)
  public async aiEventSearch(
    userId: string,
    searchQuery: string,
    filters: any
  ): Promise<any> {
    try {
      const aiEventSearchFunction = httpsCallable(
        this.functions,
        'aiEventSearch'
      );

      const result = await aiEventSearchFunction({
        userId,
        searchQuery,
        filters,
      });
      
      console.log('🧪 AI event search completed via Cloud Functions:', result);
      return result.data;
    } catch (error) {
      console.error('🧪 Error in AI event search via Cloud Functions:', error);
      throw error;
    }
  }

  // AI-powered partner matching
  public async aiPartnerMatching(
    userId: string,
    preferences: any,
    location: any
  ): Promise<any> {
    try {
      const aiPartnerMatchingFunction = httpsCallable(
        this.functions,
        'aiPartnerMatching'
      );

      const result = await aiPartnerMatchingFunction({
        userId,
        preferences,
        location,
      });
      
      console.log('🧪 AI partner matching completed via Cloud Functions:', result);
      return result.data;
    } catch (error) {
      console.error('🧪 Error in AI partner matching via Cloud Functions:', error);
      throw error;
    }
  }

  // Process payment and upgrade subscription
  public async processSubscriptionUpgrade(
    userId: string,
    subscriptionTier: string,
    paymentMethod: string
  ): Promise<any> {
    try {
      const processSubscriptionFunction = httpsCallable(
        this.functions,
        'processSubscriptionUpgrade'
      );

      const result = await processSubscriptionFunction({
        userId,
        subscriptionTier,
        paymentMethod,
      });
      
      console.log('🧪 Subscription upgrade processed via Cloud Functions:', result);
      return result.data;
    } catch (error) {
      console.error('🧪 Error processing subscription upgrade via Cloud Functions:', error);
      throw error;
    }
  }

  // Send push notification
  public async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: any
  ): Promise<any> {
    try {
      const sendNotificationFunction = httpsCallable(
        this.functions,
        'sendPushNotification'
      );

      const result = await sendNotificationFunction({
        userId,
        title,
        body,
        data,
      });
      
      console.log('🧪 Push notification sent via Cloud Functions:', result);
      return result.data;
    } catch (error) {
      console.error('🧪 Error sending push notification via Cloud Functions:', error);
      throw error;
    }
  }

  // Analytics tracking
  public async trackUserAction(
    userId: string,
    action: string,
    data?: any
  ): Promise<any> {
    try {
      const trackActionFunction = httpsCallable(
        this.functions,
        'trackUserAction'
      );

      const result = await trackActionFunction({
        userId,
        action,
        data,
        timestamp: new Date().toISOString(),
      });
      
      console.log('🧪 User action tracked via Cloud Functions:', result);
      return result.data;
    } catch (error) {
      console.error('🧪 Error tracking user action via Cloud Functions:', error);
      throw error;
    }
  }

  // Get function instance for direct access
  public getFunctions(): Functions {
    return this.functions;
  }
}

export default CloudFunctionsService.getInstance();
