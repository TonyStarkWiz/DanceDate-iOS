import { COLLECTIONS, db } from '@/config/firebase';
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    setDoc
} from 'firebase/firestore';
import { googleCustomSearchService } from './googleCustomSearchService';

// Dance Events API Configuration
const DANCE_EVENTS_API_CONFIG = {
  baseUrl: 'https://www.dance-events.info/api/v1',
  token: '55493fc73a27d20a9ac3402e8b5eff61',
  endpoint: 'events.json',
  rateLimit: {
    production: 3600000, // 1 hour in milliseconds
    development: 60000,  // 1 minute in milliseconds
  }
};

// API Response Models
export interface DanceEventsApiResponse {
  events?: DanceEvent[];
  status?: string;
  message?: string;
  count?: number;
}

export interface DanceEvent {
  id?: number;
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  organizer?: string;
  url?: string;
  website_url?: string;
  image?: string;
  location?: Location;
  dances?: Record<string, string>;
  places?: Record<string, any>;
  values?: string[];
}

export interface Location {
  name?: string;
  lat?: number;
  lng?: number;
  country?: string;
  city?: string;
  address?: string;
}

// Internal Event Model (compatible with your existing types)
export interface DisplayableEvent {
  id: string;
  title: string;
  instructor: string;
  location: string;
  lat: number;
  lng: number;
  description?: string;
  url?: string;
  website_url?: string;
  organizer?: string;
  tags: string[];
  startDate?: string;
  endDate?: string;
  image?: string;
  source: 'dance_events_api' | 'firestore' | 'sample';
  createdAt: Date;
}

// Rate limiting and caching
interface ApiCallLog {
  lastCallTime: number;
  callCount: number;
  userId: string;
}

class DanceEventsApiService {
  private apiCallLogs: Map<string, ApiCallLog> = new Map();
  private isDevelopment = __DEV__;

  // Calculate distance between two points using Haversine formula
  private haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Check rate limiting
  private async checkRateLimit(userId: string): Promise<boolean> {
    try {
      console.log('🧪 DanceEventsApiService: Checking rate limit for user:', userId);
      
      const logDoc = await getDoc(doc(db, COLLECTIONS.API_LOGS, userId));
      const now = Date.now();
      const rateLimit = this.isDevelopment ? DANCE_EVENTS_API_CONFIG.rateLimit.development : DANCE_EVENTS_API_CONFIG.rateLimit.production;
      
      if (logDoc.exists()) {
        const logData = logDoc.data() as ApiCallLog;
        const timeSinceLastCall = now - logData.lastCallTime;
        
        if (timeSinceLastCall < rateLimit) {
          const remainingTime = rateLimit - timeSinceLastCall;
          console.log('🧪 DanceEventsApiService: Rate limit active, remaining time:', Math.ceil(remainingTime / 1000), 'seconds');
          return false;
        }
      }
      
      // Update rate limit log
      await setDoc(doc(db, COLLECTIONS.API_LOGS, userId), {
        lastCallTime: now,
        callCount: (logDoc.data()?.callCount || 0) + 1,
        userId
      });
      
      console.log('🧪 DanceEventsApiService: Rate limit check passed');
      return true;
    } catch (error) {
      console.error('🧪 DanceEventsApiService: Error checking rate limit:', error);
      return false;
    }
  }

  // Fetch events from Dance Events API
  async fetchEventsFromApi(): Promise<DanceEventsApiResponse> {
    try {
      console.log('🧪 DanceEventsApiService: Fetching events from Dance Events API...');
      
      const url = `${DANCE_EVENTS_API_CONFIG.baseUrl}/${DANCE_EVENTS_API_CONFIG.endpoint}?token=${DANCE_EVENTS_API_CONFIG.token}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'DanceDate/1.0.0'
        },
        timeout: 30000 // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status}`);
      }

      const data: DanceEventsApiResponse = await response.json();
      console.log('🧪 DanceEventsApiService: API response received, events count:', data.events?.length || 0);
      
      return data;
    } catch (error) {
      console.error('🧪 DanceEventsApiService: Error fetching from API:', error);
      throw error;
    }
  }

  // Transform API events to internal format
  private transformApiEvents(apiEvents: DanceEvent[]): DisplayableEvent[] {
    console.log('🧪 DanceEventsApiService: Transforming', apiEvents.length, 'API events');
    
    return apiEvents.mapNotNull(apiEvent => {
      try {
        const lat = apiEvent.location?.lat || 0.0;
        const lng = apiEvent.location?.lng || 0.0;
        
        // Extract dance types and tags
        const danceTypes = apiEvent.dances ? Object.values(apiEvent.dances) : [];
        const values = apiEvent.values || [];
        const tags = [...danceTypes, ...values];
        
        const displayableEvent: DisplayableEvent = {
          id: `api_${apiEvent.id}`,
          title: apiEvent.name || 'Untitled Event',
          instructor: apiEvent.organizer || 'Unknown',
          location: apiEvent.location?.city || 'Unknown',
          lat,
          lng,
          description: apiEvent.description,
          url: apiEvent.url,
          website_url: apiEvent.website_url,
          organizer: apiEvent.organizer,
          tags,
          startDate: apiEvent.startDate,
          endDate: apiEvent.endDate,
          image: apiEvent.image,
          source: 'dance_events_api',
          createdAt: new Date()
        };
        
        return displayableEvent;
      } catch (error) {
        console.error('🧪 DanceEventsApiService: Error transforming event:', error);
        return null;
      }
    });
  }

  // Filter events by location
  private filterEventsByLocation(events: DisplayableEvent[], userLat: number, userLng: number, radiusMiles: number): DisplayableEvent[] {
    console.log('🧪 DanceEventsApiService: Filtering events by location, radius:', radiusMiles, 'miles');
    
    return events.filter(event => {
      const distance = this.haversineMiles(userLat, userLng, event.lat, event.lng);
      return distance <= radiusMiles;
    });
  }

  // Filter events by country
  private filterEventsByCountry(events: DisplayableEvent[], countryCode: string): DisplayableEvent[] {
    console.log('🧪 DanceEventsApiService: Filtering events by country:', countryCode);
    
    // This would need country mapping logic
    // For now, return all events
    return events;
  }

  // Cache events in Firestore
  private async cacheEvents(events: DisplayableEvent[]): Promise<void> {
    try {
      console.log('🧪 DanceEventsApiService: Caching', events.length, 'events in Firestore');
      
      const batch = [];
      for (const event of events) {
        const eventRef = doc(db, COLLECTIONS.EVENTS, event.id);
        batch.push(setDoc(eventRef, {
          ...event,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          source: event.source
        }));
      }
      
      await Promise.all(batch);
      console.log('🧪 DanceEventsApiService: Events cached successfully');
    } catch (error) {
      console.error('🧪 DanceEventsApiService: Error caching events:', error);
      throw error;
    }
  }

  // Get cached events from Firestore
  async getCachedEvents(userLat?: number, userLng?: number, radiusMiles: number = 50): Promise<DisplayableEvent[]> {
    try {
      console.log('🧪 DanceEventsApiService: Getting cached events from Firestore');
      
      const eventsQuery = query(
        collection(db, COLLECTIONS.EVENTS),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      
      const snapshot = await getDocs(eventsQuery);
      const events: DisplayableEvent[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        events.push({
          id: doc.id,
          title: data.title,
          instructor: data.instructor,
          location: data.location,
          lat: data.lat,
          lng: data.lng,
          description: data.description,
          url: data.url,
          website_url: data.website_url,
          organizer: data.organizer,
          tags: data.tags || [],
          startDate: data.startDate,
          endDate: data.endDate,
          image: data.image,
          source: data.source || 'firestore',
          createdAt: data.createdAt?.toDate() || new Date()
        });
      });
      
      console.log('🧪 DanceEventsApiService: Retrieved', events.length, 'cached events');
      
      // Filter by location if coordinates provided
      if (userLat && userLng) {
        return this.filterEventsByLocation(events, userLat, userLng, radiusMiles);
      }
      
      return events;
    } catch (error) {
      console.error('🧪 DanceEventsApiService: Error getting cached events:', error);
      return [];
    }
  }

  // Main method to fetch and cache events with tiered search
  async fetchAndCacheEvents(userId: string, userLat?: number, userLng?: number, radiusMiles: number = 50): Promise<DisplayableEvent[]> {
    try {
      console.log('🧪 DanceEventsApiService: Starting tiered search for user:', userId);
      
      // Check if user is premium
      const isPremium = await googleCustomSearchService.isUserPremium(userId);
      console.log('🧪 DanceEventsApiService: User premium status:', isPremium);
      
      if (isPremium) {
        console.log('🧪 DanceEventsApiService: Using Google Custom Search (Premium)');
        return await this.fetchWithGoogleSearch(userId, userLat, userLng, radiusMiles);
      } else {
        console.log('🧪 DanceEventsApiService: Using Dance Events API (Free)');
        return await this.fetchWithDanceEventsApi(userId, userLat, userLng, radiusMiles);
      }
    } catch (error) {
      console.error('🧪 DanceEventsApiService: Error in tiered search:', error);
      
      // Fallback to cached events
      console.log('🧪 DanceEventsApiService: Falling back to cached events');
      return this.getCachedEvents(userLat, userLng, radiusMiles);
    }
  }

  // Fetch events using Google Custom Search (Premium)
  private async fetchWithGoogleSearch(userId: string, userLat?: number, userLng?: number, radiusMiles: number = 50): Promise<DisplayableEvent[]> {
    try {
      console.log('🧪 DanceEventsApiService: Fetching with Google Custom Search');
      
      // Build search query based on location
      let searchQuery = 'dance events';
      let location = '';
      
      if (userLat && userLng && userLat !== 0 && userLng !== 0) {
        // Reverse geocode to get location name (simplified)
        location = this.reverseGeocode(userLat, userLng);
        searchQuery += ` ${location}`;
      }
      
      // Search with Google Custom Search
      const googleResults = await googleCustomSearchService.searchDanceEvents(searchQuery, location, 20);
      
      if (!googleResults || googleResults.length === 0) {
        console.log('🧪 DanceEventsApiService: No Google results, falling back to Dance Events API');
        return await this.fetchWithDanceEventsApi(userId, userLat, userLng, radiusMiles);
      }
      
      // Transform Google results to our format
      const transformedEvents = googleCustomSearchService.transformToEventFormat(googleResults);
      
      console.log('🧪 DanceEventsApiService: Google search returned', transformedEvents.length, 'events');
      
      // Cache premium events
      if (transformedEvents.length > 0) {
        await this.cacheEvents(transformedEvents);
      }
      
      return transformedEvents;
    } catch (error) {
      console.error('🧪 DanceEventsApiService: Google search error:', error);
      // Fallback to Dance Events API
      return await this.fetchWithDanceEventsApi(userId, userLat, userLng, radiusMiles);
    }
  }

  // Fetch events using Dance Events API (Free)
  private async fetchWithDanceEventsApi(userId: string, userLat?: number, userLng?: number, radiusMiles: number = 50): Promise<DisplayableEvent[]> {
    try {
      console.log('🧪 DanceEventsApiService: Fetching with Dance Events API');
      
      // Check rate limit
      const canMakeApiCall = await this.checkRateLimit(userId);
      if (!canMakeApiCall) {
        console.log('🧪 DanceEventsApiService: Rate limit exceeded, returning cached events');
        return this.getCachedEvents(userLat, userLng, radiusMiles);
      }
      
      // Fetch from API
      const apiResponse = await this.fetchEventsFromApi();
      
      if (!apiResponse.events || apiResponse.events.length === 0) {
        console.log('🧪 DanceEventsApiService: No events from API, returning cached events');
        return this.getCachedEvents(userLat, userLng, radiusMiles);
      }
      
      // Transform API events
      const transformedEvents = this.transformApiEvents(apiResponse.events);
      
      // Only filter by location if coordinates are provided AND user specifically wants location filtering
      let filteredEvents = transformedEvents;
      if (userLat && userLng && userLat !== 0 && userLng !== 0) {
        console.log('🧪 DanceEventsApiService: Filtering by location');
        filteredEvents = this.filterEventsByLocation(transformedEvents, userLat, userLng, radiusMiles);
      } else {
        console.log('🧪 DanceEventsApiService: No location filtering - showing all events');
      }
      
      console.log('🧪 DanceEventsApiService: Filtered to', filteredEvents.length, 'events');
      
      // If no events after location filtering, return all events instead
      if (filteredEvents.length === 0 && transformedEvents.length > 0) {
        console.log('🧪 DanceEventsApiService: No events in radius, showing all events instead');
        filteredEvents = transformedEvents;
      }
      
      // Cache events
      if (filteredEvents.length > 0) {
        await this.cacheEvents(filteredEvents);
      }
      
      return filteredEvents;
    } catch (error) {
      console.error('🧪 DanceEventsApiService: Error in Dance Events API fetch:', error);
      return this.getCachedEvents(userLat, userLng, radiusMiles);
    }
  }

  // Simple reverse geocoding (you might want to use a proper geocoding service)
  private reverseGeocode(lat: number, lng: number): string {
    // This is a simplified version - in production, use Google Geocoding API
    // For now, return a generic location based on coordinates
    if (lat > 40 && lat < 45 && lng > -80 && lng < -70) {
      return 'New York';
    } else if (lat > 30 && lat < 35 && lng > -120 && lng < -110) {
      return 'Los Angeles';
    } else if (lat > 40 && lat < 45 && lng > -90 && lng < -80) {
      return 'Chicago';
    } else {
      return 'United States';
    }
  }

  // Get sample events for offline use
  getSampleEvents(): DisplayableEvent[] {
    console.log('🧪 DanceEventsApiService: Returning sample events');
    
    return [
      {
        id: 'sample_1',
        title: 'Salsa Night at Latin Club',
        instructor: 'Maria Rodriguez',
        location: 'New York, NY',
        lat: 40.7128,
        lng: -74.0060,
        description: 'Join us for an exciting night of salsa dancing! All levels welcome.',
        tags: ['Salsa', 'Latin', 'Social'],
        source: 'sample',
        createdAt: new Date()
      },
      {
        id: 'sample_2',
        title: 'Bachata Workshop',
        instructor: 'Carlos Mendez',
        location: 'Los Angeles, CA',
        lat: 34.0522,
        lng: -118.2437,
        description: 'Learn the sensual art of bachata in this comprehensive workshop.',
        tags: ['Bachata', 'Workshop', 'Latin'],
        source: 'sample',
        createdAt: new Date()
      },
      {
        id: 'sample_3',
        title: 'Ballroom Dance Competition',
        instructor: 'Professional Judges',
        location: 'Chicago, IL',
        lat: 41.8781,
        lng: -87.6298,
        description: 'Annual ballroom dance competition featuring top dancers from around the world.',
        tags: ['Ballroom', 'Competition', 'Professional'],
        source: 'sample',
        createdAt: new Date()
      }
    ];
  }

  // Intelligent supplementation method
  async loadEventsWithIntelligentSupplementation(userId: string, userLat?: number, userLng?: number, radiusMiles: number = 50): Promise<DisplayableEvent[]> {
    try {
      console.log('🧪 DanceEventsApiService: Starting intelligent supplementation');
      
      // First, try to get cached events
      let events = await this.getCachedEvents(userLat, userLng, radiusMiles);
      
      // If we have less than 10 events, supplement with API (increased from 6)
      if (events.length < 10) {
        console.log('🧪 DanceEventsApiService: Less than 10 events found, supplementing with API');
        
        const apiEvents = await this.fetchAndCacheEvents(userId, userLat, userLng, radiusMiles);
        
        // Combine events, prioritizing API events
        const combinedEvents = [...apiEvents, ...events];

      // Remove duplicates based on title and location
        const uniqueEvents = this.removeDuplicates(combinedEvents);
        
        console.log('🧪 DanceEventsApiService: Combined events count:', uniqueEvents.length);
      return uniqueEvents;
      }
      
      return events;
    } catch (error) {
      console.error('🧪 DanceEventsApiService: Error in intelligent supplementation:', error);
      return this.getSampleEvents();
    }
  }

  // Remove duplicate events
  private removeDuplicates(events: DisplayableEvent[]): DisplayableEvent[] {
    const seen = new Set<string>();
    return events.filter(event => {
      const key = `${event.title}-${event.location}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Force fetch events from API (bypasses rate limiting for testing)
  async forceFetchEventsFromApi(): Promise<DisplayableEvent[]> {
    try {
      console.log('🧪 DanceEventsApiService: Force fetching events from API...');
      
      const apiResponse = await this.fetchEventsFromApi();
      
      if (!apiResponse.events || apiResponse.events.length === 0) {
        console.log('🧪 DanceEventsApiService: No events from API');
        return this.getSampleEvents();
      }
      
      const transformedEvents = this.transformApiEvents(apiResponse.events);
      console.log('🧪 DanceEventsApiService: Force fetched', transformedEvents.length, 'events');
      
      return transformedEvents;
    } catch (error) {
      console.error('🧪 DanceEventsApiService: Error force fetching events:', error);
      return this.getSampleEvents();
    }
  }
}

export const danceEventsApiService = new DanceEventsApiService();
