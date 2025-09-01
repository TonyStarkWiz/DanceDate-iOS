// AI Agent Repository for Web Version
// Mirrors the Android app's sophisticated AI-powered event discovery

import { DisplayableEvent } from './danceEventsApi';
import { googleCustomSearchClient, GoogleSearchResult } from './googleCustomSearchService';
import { LocationData, locationService } from './locationService';

export interface EventDiscoveryOptions {
  location?: LocationData;
  postalCode?: string;
  country?: string;
  screen: 'events' | 'balls' | 'classes';
  maxResults?: number;
  useGoogleSearch?: boolean;
}

export interface EventDiscoveryResult {
  events: DisplayableEvent[];
  source: 'google_search' | 'dance_events_api' | 'sample';
  searchQueries?: string[];
  locationUsed?: string;
}

// AI Agent Repository - mirrors Android's AI agent functionality
export class AIAgentRepository {
  private static instance: AIAgentRepository;

  static getInstance(): AIAgentRepository {
    if (!AIAgentRepository.instance) {
      AIAgentRepository.instance = new AIAgentRepository();
    }
    return AIAgentRepository.instance;
  }

  // Main event discovery method - mirrors Android's discoverHighConversionEvents
  async discoverHighConversionEvents(options: EventDiscoveryOptions): Promise<EventDiscoveryResult> {
    try {
      console.log('🧪 AIAgentRepository: Starting high conversion event discovery');
      
      const { screen, maxResults = 20, useGoogleSearch = true } = options;
      
      // Determine location to use
      const location = await this.determineLocation(options);
      
      if (useGoogleSearch) {
        // Try Google Custom Search first
        const googleResult = await this.discoverWithGoogleSearch(screen, location, maxResults);
        if (googleResult.events.length > 0) {
          console.log('🧪 AIAgentRepository: Google search successful, found', googleResult.events.length, 'events');
          return googleResult;
        }
      }
      
      // Fallback to Dance Events API
      console.log('🧪 AIAgentRepository: Falling back to Dance Events API');
      return await this.discoverWithDanceEventsAPI(location, maxResults);
      
    } catch (error) {
      console.error('🧪 AIAgentRepository: Event discovery error:', error);
      return this.getSampleEvents(options.screen);
    }
  }

  // Location-specific discovery - mirrors Android's discoverHighConversionEventsWithLocation
  async discoverHighConversionEventsWithLocation(
    screen: 'events' | 'balls' | 'classes',
    location: LocationData,
    maxResults: number = 20
  ): Promise<EventDiscoveryResult> {
    try {
      console.log('🧪 AIAgentRepository: Location-specific discovery for', screen);
      
      // Build location string for search
      const locationString = this.buildLocationString(location);
      
      // Generate search queries based on screen type
      const searchQueries = this.generateSearchQueries(screen, locationString);
      
      // Perform Google Custom Search
      const allResults: GoogleSearchResult[] = [];
      
      for (const query of searchQueries) {
        try {
          const results = await googleCustomSearchClient.searchDanceEvents(query, locationString, maxResults);
          allResults.push(...results);
        } catch (error) {
          console.error('🧪 AIAgentRepository: Search query failed:', query, error);
        }
      }
      
      // Transform results to events
      const events = this.transformSearchResultsToEvents(allResults, screen);
      
      console.log('🧪 AIAgentRepository: Location-specific discovery found', events.length, 'events');
      
      return {
        events: events.slice(0, maxResults),
        source: 'google_search',
        searchQueries,
        locationUsed: locationString
      };
      
    } catch (error) {
      console.error('🧪 AIAgentRepository: Location-specific discovery error:', error);
      return this.getSampleEvents(screen);
    }
  }

  // Screen-specific event generation
  async generateEventsForScreenWithLocation(
    screen: 'events' | 'balls' | 'classes',
    location?: LocationData
  ): Promise<EventDiscoveryResult> {
    try {
      console.log('🧪 AIAgentRepository: Generating events for screen:', screen);
      
      const locationToUse = location || await locationService.getCurrentLocation();
      
      switch (screen) {
        case 'events':
          return await this.generateGeneralEvents(locationToUse);
        case 'balls':
          return await this.generateComprehensiveFormalBallEvents(locationToUse);
        case 'classes':
          return await this.generateDanceClassEvents(locationToUse);
        default:
          return await this.generateGeneralEvents(locationToUse);
      }
      
    } catch (error) {
      console.error('🧪 AIAgentRepository: Screen-specific generation error:', error);
      return this.getSampleEvents(screen);
    }
  }

  // Private methods

  private async determineLocation(options: EventDiscoveryOptions): Promise<LocationData> {
    if (options.location) {
      return options.location;
    }
    
    if (options.postalCode && options.country) {
      // In a real implementation, you'd geocode the postal code
      return {
        latitude: 27.6648, // Default to Orlando
        longitude: -81.5158,
        locationName: `${options.postalCode}, ${options.country}`
      };
    }
    
    return await locationService.getCurrentLocation();
  }

  private async discoverWithGoogleSearch(
    screen: 'events' | 'balls' | 'classes',
    location: LocationData,
    maxResults: number
  ): Promise<EventDiscoveryResult> {
    const locationString = this.buildLocationString(location);
    const searchQueries = this.generateSearchQueries(screen, locationString);
    
    const allResults: GoogleSearchResult[] = [];
    
    for (const query of searchQueries.slice(0, 3)) { // Limit to 3 queries for performance
      try {
        const results = await googleCustomSearchClient.searchDanceEvents(query, locationString, maxResults);
        allResults.push(...results);
      } catch (error) {
        console.error('🧪 AIAgentRepository: Google search query failed:', query, error);
      }
    }
    
    const events = this.transformSearchResultsToEvents(allResults, screen);
    
    return {
      events: events.slice(0, maxResults),
      source: 'google_search',
      searchQueries,
      locationUsed: locationString
    };
  }

  private async discoverWithDanceEventsAPI(location: LocationData, maxResults: number): Promise<EventDiscoveryResult> {
    // This would integrate with your existing Dance Events API
    // For now, return sample events
    return {
      events: this.getSampleEvents('events').events,
      source: 'dance_events_api',
      locationUsed: this.buildLocationString(location)
    };
  }

  private generateSearchQueries(screen: 'events' | 'balls' | 'classes', location: string): string[] {
    const baseQueries = {
      events: [
        'dance events',
        'salsa social',
        'bachata night',
        'dance party'
      ],
      balls: [
        'formal ball gala dance events elegant',
        'ballroom dance competition',
        'formal dance event',
        'dance gala'
      ],
      classes: [
        'dance classes lessons workshops instruction',
        'salsa classes',
        'ballroom dance lessons',
        'dance instruction'
      ]
    };
    
    const queries = baseQueries[screen];
    return queries.map(query => `${query} ${location}`.trim());
  }

  private buildLocationString(location: LocationData): string {
    if (location.locationName) {
      return location.locationName;
    }
    
    if (location.city && location.state) {
      return `${location.city}, ${location.state}`;
    }
    
    if (location.city) {
      return location.city;
    }
    
    return 'United States';
  }

  private transformSearchResultsToEvents(results: GoogleSearchResult[], screen: 'events' | 'balls' | 'classes'): DisplayableEvent[] {
    return results.map((result, index) => ({
      id: `ai_${screen}_${index}_${Date.now()}`,
      title: result.title,
      instructor: this.extractInstructor(result.title, result.snippet),
      location: this.extractLocation(result.snippet, result.link),
      lat: 0, // Would be extracted from result if available
      lng: 0,
      description: result.snippet,
      url: result.link,
      tags: this.extractDanceStyles(result.title, result.snippet, screen),
      startDate: this.extractDate(result.snippet),
      source: 'google_search',
      createdAt: new Date(),
      image: result.image
    }));
  }

  private extractInstructor(title: string, snippet: string): string {
    const text = `${title} ${snippet}`;
    const patterns = [
      /with\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /instructor\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /taught\s+by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /by\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return 'Professional Instructor';
  }

  private extractLocation(snippet: string, link: string): string {
    const patterns = [
      /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /at\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/i,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Club/i,
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+Studio/i
    ];
    
    for (const pattern of patterns) {
      const match = snippet.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    try {
      const domain = new URL(link).hostname;
      return domain.replace('www.', '').split('.')[0];
    } catch {
      return 'Location TBD';
    }
  }

  private extractDanceStyles(title: string, snippet: string, screen: 'events' | 'balls' | 'classes'): string[] {
    const text = `${title} ${snippet}`.toLowerCase();
    const allStyles = [
      'salsa', 'bachata', 'tango', 'waltz', 'foxtrot', 'cha cha',
      'rumba', 'swing', 'lindy hop', 'west coast swing', 'east coast swing',
      'merengue', 'cumbia', 'kizomba', 'zouk', 'ballet', 'jazz',
      'contemporary', 'hip hop', 'ballroom', 'latin', 'smooth'
    ];
    
    const foundStyles = allStyles.filter(style => text.includes(style));
    
    // Add screen-specific styles
    if (screen === 'balls') {
      foundStyles.push('formal', 'elegant', 'gala');
    } else if (screen === 'classes') {
      foundStyles.push('instruction', 'lesson', 'workshop');
    }
    
    return foundStyles.slice(0, 5); // Limit to 5 styles
  }

  private extractDate(snippet: string): string {
    const patterns = [
      /(\d{1,2}\/\d{1,2}\/\d{4})/,
      /(\d{1,2}-\d{1,2}-\d{4})/,
      /(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i,
      /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4})/i
    ];
    
    for (const pattern of patterns) {
      const match = snippet.match(pattern);
      if (match) {
        return match[1];
      }
    }
    
    return 'Date TBD';
  }

  private async generateGeneralEvents(location: LocationData): Promise<EventDiscoveryResult> {
    return await this.discoverHighConversionEventsWithLocation('events', location, 20);
  }

  private async generateComprehensiveFormalBallEvents(location: LocationData): Promise<EventDiscoveryResult> {
    return await this.discoverHighConversionEventsWithLocation('balls', location, 15);
  }

  private async generateDanceClassEvents(location: LocationData): Promise<EventDiscoveryResult> {
    return await this.discoverHighConversionEventsWithLocation('classes', location, 25);
  }

  getSampleEvents(screen: 'events' | 'balls' | 'classes'): EventDiscoveryResult {
    const sampleEvents: DisplayableEvent[] = [
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
    
    return {
      events: sampleEvents,
      source: 'sample'
    };
  }
}

// Export singleton instance
export const aiAgentRepository = AIAgentRepository.getInstance();
