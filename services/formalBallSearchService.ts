// Formal Ball Search Service - Specialized for formal dance events only
// Uses Google Custom Search with curated queries for masquerade balls, charity events, waltz balls, etc.

import { GoogleCustomSearchHttpClient, GoogleSearchResult } from './googleCustomSearchService';
import { LocationData } from './locationService';

export interface FormalBallEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  date?: string;
  time?: string;
  price?: string;
  danceStyles: string[];
  eventType: 'masquerade' | 'charity' | 'waltz' | 'viennese' | 'formal' | 'gala';
  imageUrl?: string;
  source: string;
  link: string;
}

export interface FormalBallSearchOptions {
  location?: LocationData;
  postalCode?: string;
  country?: string;
  eventTypes?: string[];
  maxResults?: number;
}

export class FormalBallSearchService {
  private static instance: FormalBallSearchService;
  private googleClient: GoogleCustomSearchHttpClient;

  private constructor() {
    this.googleClient = GoogleCustomSearchHttpClient.getInstance();
  }

  static getInstance(): FormalBallSearchService {
    if (!FormalBallSearchService.instance) {
      FormalBallSearchService.instance = new FormalBallSearchService();
    }
    return FormalBallSearchService.instance;
  }

  // Main search method for formal ball events
  async searchFormalBallEvents(options: FormalBallSearchOptions): Promise<FormalBallEvent[]> {
    try {
      console.log('🧪 FormalBallSearchService: Searching for formal ball events with options:', options);
      
      const locationString = this.buildLocationString(options);
      const searchQueries = this.buildFormalBallQueries(locationString, options.eventTypes);
      
      const allResults: GoogleSearchResult[] = [];
      
      // Execute searches for each formal ball type
      for (const query of searchQueries.slice(0, 4)) { // Limit to 4 queries for performance
        try {
          const results = await this.googleClient.searchDanceEvents(query, locationString, options.maxResults || 10);
          allResults.push(...results);
        } catch (error) {
          console.error('🧪 FormalBallSearchService: Search query failed:', query, error);
        }
      }
      
      // Transform and filter results to only include formal events
      const formalEvents = this.transformToFormalBallEvents(allResults);
      
      console.log('🧪 FormalBallSearchService: Found', formalEvents.length, 'formal ball events');
      return formalEvents;
      
    } catch (error) {
      console.error('🧪 FormalBallSearchService: Search error:', error);
      return [];
    }
  }

  // Build location string from options
  private buildLocationString(options: FormalBallSearchOptions): string {
    if (options.location) {
      return options.location.locationName || `${options.location.latitude}, ${options.location.longitude}`;
    }
    
    if (options.postalCode && options.country) {
      return `${options.postalCode}, ${options.country}`;
    }
    
    return '';
  }

  // Build specialized queries for formal ball events only
  private buildFormalBallQueries(location: string, eventTypes?: string[]): string[] {
    const baseQueries = [
      // Masquerade balls
      'masquerade ball dance event formal',
      'masquerade dance ball gala',
      
      // Charity balls
      'charity ball dance event formal',
      'charity gala ball dance',
      
      // Waltz and Viennese balls
      'waltz ball dance event formal',
      'viennese waltz ball dance event',
      
      // General formal balls
      'formal ball dance event gala',
      'ballroom dance ball formal event'
    ];

    // Add location to queries
    const locationSuffix = location ? ` near ${location}` : '';
    const queries = baseQueries.map(query => query + locationSuffix);

    // Filter by specific event types if requested
    if (eventTypes && eventTypes.length > 0) {
      return queries.filter(query => 
        eventTypes.some(type => query.toLowerCase().includes(type.toLowerCase()))
      );
    }

    return queries;
  }

  // Transform Google search results to formal ball events
  private transformToFormalBallEvents(results: GoogleSearchResult[]): FormalBallEvent[] {
    const formalEvents: FormalBallEvent[] = [];
    
    for (const result of results) {
      const event = this.parseFormalBallEvent(result);
      if (event && this.isFormalBallEvent(event)) {
        formalEvents.push(event);
      }
    }
    
    // Remove duplicates based on title and location
    return this.removeDuplicateEvents(formalEvents);
  }

  // Parse a Google search result into a formal ball event
  private parseFormalBallEvent(result: GoogleSearchResult): FormalBallEvent | null {
    try {
      const title = result.title || '';
      const description = result.snippet || '';
      const link = result.link || '';
      
      // Extract event type from title/description
      const eventType = this.determineEventType(title, description);
      
      // Extract dance styles
      const danceStyles = this.extractDanceStyles(title, description);
      
      // Extract location from title or description
      const location = this.extractLocation(title, description);
      
      // Extract price if mentioned
      const price = this.extractPrice(description);
      
      // Extract date/time if mentioned
      const { date, time } = this.extractDateTime(description);
      
      return {
        id: this.generateEventId(result),
        title: this.cleanTitle(title),
        description: this.cleanDescription(description),
        location: location || 'Location TBD',
        date,
        time,
        price,
        danceStyles,
        eventType,
        imageUrl: result.image,
        source: result.source || 'Google Search',
        link
      };
      
    } catch (error) {
      console.error('🧪 FormalBallSearchService: Error parsing event:', error);
      return null;
    }
  }

  // Determine event type from title and description
  private determineEventType(title: string, description: string): FormalBallEvent['eventType'] {
    const text = (title + ' ' + description).toLowerCase();
    
    if (text.includes('masquerade')) return 'masquerade';
    if (text.includes('charity')) return 'charity';
    if (text.includes('viennese')) return 'viennese';
    if (text.includes('waltz')) return 'waltz';
    if (text.includes('gala')) return 'gala';
    
    return 'formal';
  }

  // Extract dance styles from text
  private extractDanceStyles(title: string, description: string): string[] {
    const text = (title + ' ' + description).toLowerCase();
    const styles: string[] = [];
    
    const danceStyleMap = {
      'waltz': 'Waltz',
      'viennese waltz': 'Viennese Waltz',
      'foxtrot': 'Foxtrot',
      'tango': 'Tango',
      'quickstep': 'Quickstep',
      'polka': 'Polka',
      'ballroom': 'Ballroom',
      'latin': 'Latin',
      'swing': 'Swing'
    };
    
    for (const [key, value] of Object.entries(danceStyleMap)) {
      if (text.includes(key) && !styles.includes(value)) {
        styles.push(value);
      }
    }
    
    // Default to Waltz if no styles found
    if (styles.length === 0) {
      styles.push('Waltz');
    }
    
    return styles;
  }

  // Extract location from text
  private extractLocation(title: string, description: string): string | null {
    const text = (title + ' ' + description);
    
    // Look for common location patterns
    const locationPatterns = [
      /at\s+([^,]+(?:ballroom|hall|center|theater|opera|hotel)[^,]*)/i,
      /in\s+([^,]+(?:ballroom|hall|center|theater|opera|hotel)[^,]*)/i,
      /([^,]+(?:ballroom|hall|center|theater|opera|hotel)[^,]*)/i
    ];
    
    for (const pattern of locationPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return null;
  }

  // Extract price from description
  private extractPrice(description: string): string | null {
    const pricePattern = /\$[\d,]+(?:\.\d{2})?/;
    const match = description.match(pricePattern);
    return match ? match[0] : null;
  }

  // Extract date and time from description
  private extractDateTime(description: string): { date?: string; time?: string } {
    // Look for date patterns
    const datePattern = /(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2}-\d{1,2}-\d{4}/i;
    const dateMatch = description.match(datePattern);
    
    // Look for time patterns
    const timePattern = /\d{1,2}:\d{2}\s*(?:am|pm)?/i;
    const timeMatch = description.match(timePattern);
    
    return {
      date: dateMatch ? dateMatch[0] : undefined,
      time: timeMatch ? timeMatch[0] : undefined
    };
  }

  // Generate unique event ID
  private generateEventId(result: GoogleSearchResult): string {
    return `ball_${result.link ? btoa(result.link).slice(0, 10) : Date.now()}`;
  }

  // Clean title text
  private cleanTitle(title: string): string {
    return title
      .replace(/[^\w\s\-&,()]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 100);
  }

  // Clean description text
  private cleanDescription(description: string): string {
    return description
      .replace(/[^\w\s\-&,().!?]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 200);
  }

  // Check if event is actually a formal ball event
  private isFormalBallEvent(event: FormalBallEvent): boolean {
    const text = (event.title + ' ' + event.description).toLowerCase();
    
    // Must contain formal ball keywords
    const formalKeywords = ['ball', 'gala', 'masquerade', 'charity', 'formal', 'waltz', 'ballroom'];
    const hasFormalKeyword = formalKeywords.some(keyword => text.includes(keyword));
    
    // Must NOT contain generic dance keywords
    const genericKeywords = ['class', 'lesson', 'workshop', 'social', 'party', 'club', 'bar'];
    const hasGenericKeyword = genericKeywords.some(keyword => text.includes(keyword));
    
    return hasFormalKeyword && !hasGenericKeyword;
  }

  // Remove duplicate events
  private removeDuplicateEvents(events: FormalBallEvent[]): FormalBallEvent[] {
    const seen = new Set<string>();
    return events.filter(event => {
      const key = `${event.title.toLowerCase()}_${event.location.toLowerCase()}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }
}

// Export singleton instance
export const formalBallSearchService = FormalBallSearchService.getInstance();
