import { Timestamp } from 'firebase/firestore';

// Basic User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  username?: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Premium User Model (ported from Android PremiumUserModel.kt)
export interface PremiumUser {
  userId: string;
  isPremium: boolean;
  subscriptionTier: SubscriptionTier;
  aiSearchesRemaining: number;
  aiSearchesUsed: number;
  subscriptionStartDate: Date | null;
  subscriptionEndDate: Date | null;
  lastSearchDate: Date | null;
}

// Partial PremiumUser for updates
export interface PartialPremiumUser {
  userId?: string;
  isPremium?: boolean;
  subscriptionTier?: SubscriptionTier;
  aiSearchesRemaining?: number;
  aiSearchesUsed?: number;
  subscriptionStartDate?: Date | null;
  subscriptionEndDate?: Date | null;
  lastSearchDate?: Date | null;
}

export enum SubscriptionTier {
  FREE = 'FREE',
  PREMIUM_MONTHLY = 'PREMIUM_MONTHLY',
  PREMIUM_ANNUAL = 'PREMIUM_ANNUAL'
}

export const SUBSCRIPTION_TIERS = {
  [SubscriptionTier.FREE]: {
    displayName: 'Free',
    price: 0.0,
    aiSearchesPerMonth: 5
  },
  [SubscriptionTier.PREMIUM_MONTHLY]: {
    displayName: 'Premium',
    price: 9.99,
    aiSearchesPerMonth: -1 // -1 means unlimited
  },
  [SubscriptionTier.PREMIUM_ANNUAL]: {
    displayName: 'Pro',
    price: 149.99,
    aiSearchesPerMonth: -1 // -1 means unlimited
  }
};

// User Preferences (ported from Android InterestModels.kt)
export interface UserPreferences {
  userId: string;
  danceInterests: Set<DanceInterest>;
  experienceLevel: DanceDifficulty;
  goals: Set<DanceInterest>;
  preferredPartners: Set<PartnerPreference>;
  availability: Set<Availability>;
  location: LocationPreference | null;
  lastUpdated: number; // Unix timestamp
}

// Partial UserPreferences for updates
export interface PartialUserPreferences {
  userId?: string;
  danceInterests?: Set<DanceInterest>;
  experienceLevel?: DanceDifficulty;
  goals?: Set<DanceInterest>;
  preferredPartners?: Set<PartnerPreference>;
  availability?: Set<Availability>;
  location?: LocationPreference | null;
  lastUpdated?: number;
}

export interface DanceInterest {
  id: string;
  name: string;
  level: InterestLevel;
  category: DanceCategory;
}

export enum InterestLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  PRIMARY = 'PRIMARY',
  PASSIONATE = 'PASSIONATE'
}

export enum DanceDifficulty {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT'
}

export enum DanceCategory {
  LATIN = 'LATIN',
  BALLROOM = 'BALLROOM',
  SWING = 'SWING',
  HIPHOP = 'HIPHOP',
  CONTEMPORARY = 'CONTEMPORARY',
  FOLK = 'FOLK',
  OTHER = 'OTHER'
}

export interface PartnerPreference {
  id: string;
  name: string;
  description: string;
}

export interface Availability {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
}

export interface LocationPreference {
  latitude: number;
  longitude: number;
  radius: number; // in kilometers
  city?: string;
  state?: string;
  country?: string;
}

// User Credits System (ported from Android UserCredits.kt)
export interface UserCredits {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  lastUpdated: Timestamp;
  creditHistory: CreditTransaction[];
  subscriptionTier: CreditSubscriptionTier;
}

export interface CreditTransaction {
  id: string;
  amount: number; // positive for earned, negative for spent
  type: TransactionType;
  description: string;
  videoId?: string;
  segmentId?: string;
  timestamp: Timestamp;
  balanceAfter: number;
}

export enum TransactionType {
  PURCHASE = 'PURCHASE',
  EARNED = 'EARNED',
  REFUND = 'REFUND',
  BONUS = 'BONUS',
  SUBSCRIPTION = 'SUBSCRIPTION'
}

export enum CreditSubscriptionTier {
  FREE = 'FREE',
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  PRO = 'PRO'
}

// Chat & Social Models (ported from Android)
export interface BlockedUser {
  blockerId: string;
  blockedId: string;
  blockedAt: Date;
}

export interface ReportedUser {
  reporterId: string;
  reportedId: string;
  reason: string;
  timestamp: number; // Unix timestamp
  status: ReportStatus;
}

export enum ReportStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED'
}

// Extended User Profile
export interface ExtendedUserProfile extends User {
  premiumUser?: PremiumUser;
  preferences?: UserPreferences;
  credits?: UserCredits;
  blockedUsers?: BlockedUser[];
  reportedUsers?: ReportedUser[];
  isVerified?: boolean;
  lastActive?: Date;
  totalEvents?: number;
  totalPartners?: number;
  rating?: number;
  reviews?: number;
}

// User Session
export interface UserSession {
  user: ExtendedUserProfile;
  token: string;
  expiresAt: Date;
  isActive: boolean;
}

// User Statistics
export interface UserStats {
  userId: string;
  eventsAttended: number;
  eventsCreated: number;
  partnersMatched: number;
  postsCreated: number;
  likesReceived: number;
  commentsReceived: number;
  followersCount: number;
  followingCount: number;
  lastUpdated: Date;
}




