// Google Custom Search Service for Web Version
// Mirrors the Android app's sophisticated search infrastructure

export interface GoogleSearchResult {
  title: string;
  link: string;
  snippet: string;
  image?: string;
  source: string;
}

export interface SearchQuery {
  query: string;
  location?: string;
  screen: 'events' | 'balls' | 'classes';
  maxResults?: number;
}

export interface UsageData {
  userId: string;
  screen: string;
  date: string;
  searchCount: number;
  isPremium: boolean;
}

// Google Custom Search HTTP Client - mirrors Android implementation
export class GoogleCustomSearchHttpClient {
  private static instance: GoogleCustomSearchHttpClient;
  private readonly apiKey = 'AIzaSyBTIR8d1fRiWDH5SUKmgZwyGXnF1s1xfG0';
  private readonly searchEngineId = 'c63b840d0b01d4d28';
  private readonly baseUrl = 'https://www.googleapis.com/customsearch/v1';
  
  // Rate limiting
  private lastSearchTime = 0;
  private searchCount = 0;
  private readonly rateLimitDelay = 1000; // 1 second between searches
  private readonly maxSearchesPerRequest = 5;
  
  // Caching
  private memoryCache = new Map<string, { data: GoogleSearchResult[]; timestamp: number }>();
  private readonly cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours

  static getInstance(): GoogleCustomSearchHttpClient {
    if (!GoogleCustomSearchHttpClient.instance) {
      GoogleCustomSearchHttpClient.instance = new GoogleCustomSearchHttpClient();
    }
    return GoogleCustomSearchHttpClient.instance;
  }

  // Main search method - mirrors Android's searchDanceEvents
  async searchDanceEvents(
    query: string, 
    location: string = '', 
    maxResults: number = 10
  ): Promise<GoogleSearchResult[]> {
    try {
      console.log('🧪 GoogleCustomSearchHttpClient: Searching for:', query, 'in', location);
      
      // Check rate limiting
      await this.checkRateLimit();
      
      // Build search queries
      const searchQueries = this.buildSearchQueries(query, location);
      const allResults: GoogleSearchResult[] = [];
      
      // Execute multiple searches with rate limiting
      for (let i = 0; i < Math.min(searchQueries.length, this.maxSearchesPerRequest); i++) {
        const searchQuery = searchQueries[i];
        const cacheKey = this.generateCacheKey(searchQuery);
        
        // Check cache first
        const cachedResult = this.getFromCache(cacheKey);
        if (cachedResult) {
          console.log('🧪 GoogleCustomSearchHttpClient: Using cached result for:', searchQuery);
          allResults.push(...cachedResult);
          continue;
        }
        
        // Perform search
        const results = await this.performSearch(searchQuery, maxResults);
        allResults.push(...results);
        
        // Cache results
        this.cacheResults(cacheKey, results);
        
        // Rate limiting delay
        if (i < searchQueries.length - 1) {
          await this.delay(this.rateLimitDelay);
        }
      }
      
      // Remove duplicates and limit results
      const uniqueResults = this.removeDuplicates(allResults);
      const limitedResults = uniqueResults.slice(0, maxResults);
      
      console.log('🧪 GoogleCustomSearchHttpClient: Found', limitedResults.length, 'unique results');
      return limitedResults;
      
    } catch (error) {
      console.error('🧪 GoogleCustomSearchHttpClient: Search error:', error);
      return [];
    }
  }

  // Build intelligent search queries - optimized specifically for dance events
  private buildSearchQueries(query: string, location: string): string[] {
    const locationSuffix = location ? ` ${location}` : '';
    
    // Specific dance event queries - ensuring only dance-related results
    const danceEventQueries = [
      `dance events${locationSuffix}`,
      `dance classes${locationSuffix}`,
      `dance lessons${locationSuffix}`,
      `dance workshops${locationSuffix}`,
      `dance social events${locationSuffix}`,
      `salsa events${locationSuffix}`,
      `bachata events${locationSuffix}`,
      `tango events${locationSuffix}`,
      `ballroom dance events${locationSuffix}`,
      `swing dance events${locationSuffix}`,
      `latin dance events${locationSuffix}`,
      `dance studio events${locationSuffix}`
    ];
    
    // Platform-specific queries for dance events
    const platformQueries = [
      `site:eventbrite.com dance events${locationSuffix}`,
      `site:meetup.com dance${locationSuffix}`,
      `site:facebook.com/events dance${locationSuffix}`,
      `site:dancecalendar.com${locationSuffix}`,
      `site:danceevents.com${locationSuffix}`
    ];
    
    return [...danceEventQueries, ...platformQueries];
  }

  // Perform individual search
  private async performSearch(query: string, maxResults: number): Promise<GoogleSearchResult[]> {
    const url = new URL(this.baseUrl);
    url.searchParams.set('key', this.apiKey);
    url.searchParams.set('cx', this.searchEngineId);
    url.searchParams.set('q', query);
    url.searchParams.set('num', Math.min(maxResults, 10).toString());
    // Remove image search - we want web content for dance classes
    // url.searchParams.set('searchType', 'image');
    // url.searchParams.set('imgType', 'photo');
    
    try {
      console.log('🧪 GoogleCustomSearchHttpClient: Performing search for:', query);
      
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url.toString(), {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        console.error('🧪 GoogleCustomSearchHttpClient: API returned error:', data.error);
        throw new Error(data.error.message || 'API Error');
      }
      
      if (data.items) {
        console.log('🧪 GoogleCustomSearchHttpClient: Found', data.items.length, 'results');
        return data.items.map((item: any) => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet,
          image: item.pagemap?.cse_image?.[0]?.src || item.pagemap?.metatags?.[0]?.['og:image'],
          source: this.extractSource(item.link)
        }));
      }
      
      console.log('🧪 GoogleCustomSearchHttpClient: No items found in response');
      return [];
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('🧪 GoogleCustomSearchHttpClient: Request timeout');
        throw new Error('Request timeout - please try again');
      }
      console.error('🧪 GoogleCustomSearchHttpClient: API error:', error);
      throw error;
    }
  }

  // Rate limiting check
  private async checkRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastSearch = now - this.lastSearchTime;
    
    if (timeSinceLastSearch < this.rateLimitDelay) {
      const delay = this.rateLimitDelay - timeSinceLastSearch;
      console.log('🧪 GoogleCustomSearchHttpClient: Rate limiting, waiting', delay, 'ms');
      await this.delay(delay);
    }
    
    this.lastSearchTime = Date.now();
    this.searchCount++;
  }

  // Caching methods
  private generateCacheKey(query: string): string {
    return `search_${btoa(query).replace(/[^a-zA-Z0-9]/g, '')}`;
  }

  private getFromCache(key: string): GoogleSearchResult[] | null {
    const cached = this.memoryCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }
    this.memoryCache.delete(key);
    return null;
  }

  private cacheResults(key: string, results: GoogleSearchResult[]): void {
    this.memoryCache.set(key, {
      data: results,
      timestamp: Date.now()
    });
  }

  // Utility methods
  private removeDuplicates(results: GoogleSearchResult[]): GoogleSearchResult[] {
    const seen = new Set<string>();
    return results.filter(result => {
      const key = `${result.title}-${result.link}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private extractSource(url: string): string {
    try {
      const domain = new URL(url).hostname;
      if (domain.includes('facebook.com')) return 'Facebook';
      if (domain.includes('eventbrite.com')) return 'Eventbrite';
      if (domain.includes('instagram.com')) return 'Instagram';
      return domain;
    } catch {
      return 'Unknown';
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Usage Tracking - mirrors Android's GoogleCustomSearchUsageTracker
export class GoogleCustomSearchUsageTracker {
  private static instance: GoogleCustomSearchUsageTracker;

  static getInstance(): GoogleCustomSearchUsageTracker {
    if (!GoogleCustomSearchUsageTracker.instance) {
      GoogleCustomSearchUsageTracker.instance = new GoogleCustomSearchUsageTracker();
    }
    return GoogleCustomSearchUsageTracker.instance;
  }

  // Track search usage
  async trackSearchUsage(userId: string, screen: string): Promise<boolean> {
    try {
      console.log('🧪 GoogleCustomSearchUsageTracker: Tracking usage for user:', userId, 'screen:', screen);
      
      const today = new Date().toISOString().split('T')[0];
      const usageKey = `usage_${userId}_${screen}_${today}`;
      
      // Get current usage from localStorage (in real app, this would be in database)
      const currentUsage = this.getCurrentUsage(usageKey);
      
      if (currentUsage >= 5) {
        console.log('🧪 GoogleCustomSearchUsageTracker: Daily limit reached');
        return false;
      }
      
      // Increment usage
      this.incrementUsage(usageKey);
      
      console.log('🧪 GoogleCustomSearchUsageTracker: Usage tracked successfully');
      return true;
      
    } catch (error) {
      console.error('🧪 GoogleCustomSearchUsageTracker: Error tracking usage:', error);
      return false;
    }
  }

  // Check if user can perform search
  async canPerformSearch(userId: string, screen: string): Promise<boolean> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const usageKey = `usage_${userId}_${screen}_${today}`;
      const currentUsage = this.getCurrentUsage(usageKey);
      
      // Premium users have unlimited access
      const isPremium = await this.isUserPremium(userId);
      if (isPremium) {
        return true;
      }
      
      // Free users limited to 5 searches per day
      return currentUsage < 5;
      
    } catch (error) {
      console.error('🧪 GoogleCustomSearchUsageTracker: Error checking search permission:', error);
      return false;
    }
  }

  // Get current usage count
  private getCurrentUsage(key: string): number {
    try {
      const usage = localStorage.getItem(key);
      return usage ? parseInt(usage, 10) : 0;
    } catch {
      return 0;
    }
  }

  // Increment usage count
  private incrementUsage(key: string): void {
    try {
      const currentUsage = this.getCurrentUsage(key);
      localStorage.setItem(key, (currentUsage + 1).toString());
    } catch (error) {
      console.error('🧪 GoogleCustomSearchUsageTracker: Error incrementing usage:', error);
    }
  }

  // Check if user is premium
  private async isUserPremium(userId: string): Promise<boolean> {
    try {
      // In real app, this would check Firestore
      // For now, check localStorage
      const premiumKey = `premium_${userId}`;
      return localStorage.getItem(premiumKey) === 'true';
    } catch {
      return false;
    }
  }

  // Get usage statistics
  async getUsageStats(userId: string, screen: string): Promise<{
    todayUsage: number;
    isPremium: boolean;
    canSearch: boolean;
  }> {
    const today = new Date().toISOString().split('T')[0];
    const usageKey = `usage_${userId}_${screen}_${today}`;
    const todayUsage = this.getCurrentUsage(usageKey);
    const isPremium = await this.isUserPremium(userId);
    const canSearch = isPremium || todayUsage < 5;
    
    return {
      todayUsage,
      isPremium,
      canSearch
    };
  }
}

// Export singleton instances
export const googleCustomSearchClient = GoogleCustomSearchHttpClient.getInstance();
export const usageTracker = GoogleCustomSearchUsageTracker.getInstance();

// Test function to check Google Custom Search functionality
export async function testGoogleCustomSearch(): Promise<{
  success: boolean;
  error?: string;
  results?: GoogleSearchResult[];
  apiKey?: string;
  searchEngineId?: string;
}> {
  try {
    console.log('🧪 Testing Google Custom Search...');
    
    const client = GoogleCustomSearchHttpClient.getInstance();
    
    // Test basic search
    const testQuery = 'salsa dance events';
    const testLocation = 'New York';
    
    console.log('🧪 Testing search with query:', testQuery, 'location:', testLocation);
    
    const results = await client.searchDanceEvents(testQuery, testLocation, 5);
    
    console.log('🧪 Search results:', results);
    
    return {
      success: true,
      results: results,
      apiKey: client['apiKey']?.substring(0, 10) + '...',
      searchEngineId: client['searchEngineId']
    };
    
  } catch (error) {
    console.error('🧪 Google Custom Search test failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Test function to check API credentials
export async function testGoogleCustomSearchCredentials(): Promise<{
  apiKeyValid: boolean;
  searchEngineIdValid: boolean;
  apiKey?: string;
  searchEngineId?: string;
  error?: string;
}> {
  try {
    const client = GoogleCustomSearchHttpClient.getInstance();
    
    // Test API key and search engine ID
    const testUrl = new URL('https://www.googleapis.com/customsearch/v1');
    testUrl.searchParams.set('key', client['apiKey']);
    testUrl.searchParams.set('cx', client['searchEngineId']);
    testUrl.searchParams.set('q', 'test');
    testUrl.searchParams.set('num', '1');
    
    console.log('🧪 Testing API credentials...');
    console.log('🧪 API Key:', client['apiKey']?.substring(0, 10) + '...');
    console.log('🧪 Search Engine ID:', client['searchEngineId']);
    
    const response = await fetch(testUrl.toString());
    const data = await response.json();
    
    console.log('🧪 API Response:', data);
    
    if (data.error) {
      return {
        apiKeyValid: false,
        searchEngineIdValid: false,
        apiKey: client['apiKey']?.substring(0, 10) + '...',
        searchEngineId: client['searchEngineId'],
        error: data.error.message || 'API Error'
      };
    }
    
    return {
      apiKeyValid: true,
      searchEngineIdValid: true,
      apiKey: client['apiKey']?.substring(0, 10) + '...',
      searchEngineId: client['searchEngineId']
    };
    
  } catch (error) {
    console.error('🧪 Credential test failed:', error);
    return {
      apiKeyValid: false,
      searchEngineIdValid: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
