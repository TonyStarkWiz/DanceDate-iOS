// Core event structure - converted from Kotlin data class
export interface DanceEvent {
  id: number;
  title: string;
  instructor: string;
  location: string;
  tags: string[];
  lat: number;
  lng: number;
  url?: string;
  website_url?: string;
  organizer?: string;
  description?: string;
}

// API response models
export interface DanceEventsApiResponse {
  events?: DanceEvent[];
  status?: string;
  message?: string;
  count?: number;
}

// Event types for categorization
export enum EventType {
  CLASS = 'class',
  SOCIAL = 'social',
  COMPETITION = 'competition',
  WORKSHOP = 'workshop',
  BALL = 'ball'
}

// Extended event with additional metadata
export interface ExtendedDanceEvent extends DanceEvent {
  type: EventType;
  startDate: Date;
  endDate: Date;
  price?: number;
  maxParticipants?: number;
  currentParticipants: number;
  isBooked?: boolean;
}




