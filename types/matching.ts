// Matching models - converted from Kotlin data classes
export interface MatchPreview {
  userId: string;
  userName: string;
  userImageUrl?: string;
  eventId: string;
  eventTitle: string;
  matchStrength: number;
  commonInterests: string[];
  distance: number;
  lastActive: Date;
}

export interface Match {
  id: string;
  userId1: string;
  userId2: string;
  eventId: string;
  matchStrength: number;
  status: MatchStatus;
  createdAt: Date;
  lastInteraction: Date;
  isMutual: boolean;
  // Additional fields from your Firestore structure
  partnerName?: string;
  partnerLocation?: string;
  partnerBio?: string;
  matchType?: string;
  partnerInterests?: string[];
}

export enum MatchStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

// Match request and response
export interface MatchRequest {
  fromUserId: string;
  toUserId: string;
  eventId: string;
  message?: string;
  timestamp: Date;
}

export interface MatchResponse {
  requestId: string;
  response: 'accept' | 'decline';
  message?: string;
  timestamp: Date;
}

// Matching preferences and filters
export interface MatchingFilters {
  danceStyles: string[];
  experienceLevel: ExperienceLevel[];
  maxDistance: number;
  ageRange: [number, number];
  availability: Date[];
  eventTypes: EventType[];
}

// Match analytics
export interface MatchAnalytics {
  totalMatches: number;
  mutualMatches: number;
  responseRate: number;
  averageMatchStrength: number;
  topDanceStyles: string[];
}




