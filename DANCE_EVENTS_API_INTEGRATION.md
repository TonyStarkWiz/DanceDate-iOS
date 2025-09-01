# 🎯 Dance Events API Integration

## Overview

The DanceDate app now features a comprehensive **Dance Events API integration** that fetches real dance events from the Dance Events API at `https://www.dance-events.info/api/v1/events.json?token=55493fc73a27d20a9ac3402e8b5eff61`. This integration provides users with access to real dance events while maintaining performance and respecting rate limits.

## 🔧 API Configuration

### **API Details:**
- **Base URL:** `https://www.dance-events.info/api/v1`
- **Token:** `55493fc73a27d20a9ac3402e8b5eff61`
- **Endpoint:** `events.json`
- **Rate Limits:**
  - **Production:** 1 call per hour
  - **Development:** 1 call per minute

### **Authentication:**
```typescript
const DANCE_EVENTS_API_CONFIG = {
  baseUrl: 'https://www.dance-events.info/api/v1',
  token: '55493fc73a27d20a9ac3402e8b5eff61',
  endpoint: 'events.json',
  rateLimit: {
    production: 3600000, // 1 hour in milliseconds
    development: 60000,  // 1 minute in milliseconds
  }
};
```

## 🏗️ Architecture

### **Service Layer:**
- **`DanceEventsApiService`** - Main service class handling all API interactions
- **Rate Limiting** - Prevents API abuse with user-specific call tracking
- **Caching Strategy** - Stores events in Firestore for offline access
- **Location Filtering** - Filters events by user's GPS coordinates
- **Intelligent Supplementation** - Combines API events with cached events

### **Data Flow:**
```
User Request → Rate Limit Check → API Call → Transform Data → Cache → Filter → Display
```

## 📊 Data Models

### **API Response Models:**
```typescript
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
```

### **Internal Event Model:**
```typescript
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
```

## 🔄 Core Methods

### **1. Main API Fetch:**
```typescript
async fetchEventsFromApi(): Promise<DanceEventsApiResponse>
```
- Makes HTTP request to Dance Events API
- Handles timeouts (30 seconds)
- Returns raw API response

### **2. Rate Limiting:**
```typescript
private async checkRateLimit(userId: string): Promise<boolean>
```
- Checks user's last API call time
- Enforces production/development limits
- Logs calls in Firestore for tracking

### **3. Data Transformation:**
```typescript
private transformApiEvents(apiEvents: DanceEvent[]): DisplayableEvent[]
```
- Converts API format to internal format
- Extracts dance types and tags
- Handles missing data gracefully

### **4. Location Filtering:**
```typescript
private filterEventsByLocation(events: DisplayableEvent[], userLat: number, userLng: number, radiusMiles: number): DisplayableEvent[]
```
- Uses Haversine formula for distance calculation
- Filters events within specified radius
- Handles missing coordinates

### **5. Caching:**
```typescript
private async cacheEvents(events: DisplayableEvent[]): Promise<void>
async getCachedEvents(userLat?: number, userLng?: number, radiusMiles: number = 50): Promise<DisplayableEvent[]>
```
- Stores events in Firestore
- Retrieves cached events with location filtering
- Handles offline scenarios

### **6. Intelligent Supplementation:**
```typescript
async loadEventsWithIntelligentSupplementation(userId: string, userLat?: number, userLng?: number, radiusMiles: number = 50): Promise<DisplayableEvent[]>
```
- Gets cached events first
- If < 6 events, supplements with API
- Combines and deduplicates results

## 🎨 User Interface Integration

### **Enhanced EventListScreen:**
- **Real-time Loading** - Shows progress during API calls
- **Location-based Search** - "Use My Location" button
- **Source Transparency** - Shows event source (API/Cache/Sample)
- **Pull-to-Refresh** - Manual refresh capability
- **Empty States** - Helpful messages when no events found

### **Key Features:**
- **Event Cards** with source badges
- **Dance Style Tags** extracted from API
- **Location Filtering** with radius selection
- **Error Handling** with user-friendly messages
- **Offline Support** with cached events

## 🔒 Security & Rate Limiting

### **Firestore Security Rules:**
```javascript
// API logs collection - users can only access their own API call logs
match /api_logs/{userId} {
  allow read, write: if isSignedIn() && request.auth.uid == userId;
}

// Events collection - users can read all events, create if signed in
match /events/{eventId} {
  allow read: if isSignedIn();
  allow create: if isSignedIn();
  allow update, delete: if isSignedIn() && resource.data.createdBy == request.auth.uid;
}
```

### **Rate Limiting Implementation:**
- **User-specific tracking** in Firestore
- **Time-based enforcement** (hourly/minute limits)
- **Graceful degradation** to cached events
- **Development vs Production** different limits

## 🚀 Performance Optimizations

### **Caching Strategy:**
- **Firestore Storage** - Persistent event storage
- **Memory Caching** - Quick access to recent events
- **Batch Operations** - Efficient bulk data operations
- **Deduplication** - Removes duplicate events

### **Location Intelligence:**
- **GPS Priority** - Uses actual coordinates when available
- **Country Fallback** - Filters by country when no GPS
- **Distance Calculation** - Haversine formula for accurate distances
- **Radius Filtering** - Configurable search radius

### **Error Handling:**
- **Network Timeouts** - 30-second timeout for API calls
- **JSON Parsing** - Graceful handling of malformed responses
- **Rate Limit Violations** - Automatic fallback to cached data
- **User Feedback** - Clear error messages and recovery options

## 📱 Testing & Debugging

### **Debug Features:**
- **🧪 Console Logging** - Easy filtering with emoji prefix
- **API Call Tracking** - Detailed logging of all API interactions
- **Performance Metrics** - Response times and success rates
- **Error Tracking** - Comprehensive error logging

### **Test URLs:**
- **Event List:** `http://localhost:8081/eventList`
- **Location Search:** Use "Use My Location" button
- **API Testing:** Check console for 🧪 logs

### **Sample Events:**
- **Offline Fallback** - Sample events when API unavailable
- **Development Testing** - Consistent test data
- **User Experience** - Always show some events

## 🔮 Future Enhancements

### **Planned Features:**
- [ ] **Advanced Filtering** - Dance style, date range, price
- [ ] **Event Recommendations** - AI-powered suggestions
- [ ] **Event Bookmarking** - Save favorite events
- [ ] **Push Notifications** - New events in your area
- [ ] **Social Features** - Share events with friends
- [ ] **Event Reviews** - User ratings and reviews

### **Performance Improvements:**
- [ ] **Background Sync** - Automatic event updates
- [ ] **Image Caching** - Optimize event images
- [ ] **Pagination** - Load events in batches
- [ ] **Search Indexing** - Fast text search
- [ ] **Geolocation Optimization** - Better location services

## 📊 Analytics & Monitoring

### **Key Metrics:**
- **API Call Success Rate** - Track API reliability
- **Cache Hit Rate** - Measure caching effectiveness
- **User Engagement** - Event view and interaction rates
- **Location Usage** - How often users enable location
- **Error Rates** - Monitor and fix issues

### **Logging Strategy:**
```typescript
console.log('🧪 DanceEventsApiService: Starting fetchAndCacheEvents');
console.log('🧪 DanceEventsApiService: API response received, events count:', data.events?.length || 0);
console.log('🧪 DanceEventsApiService: Rate limit active, remaining time:', Math.ceil(remainingTime / 1000), 'seconds');
```

## 🎉 Success Metrics

The Dance Events API integration provides:
- **Real Event Data** - Access to actual dance events worldwide
- **Location Intelligence** - Relevant events near users
- **Offline Reliability** - Cached events when API unavailable
- **Performance** - Fast loading with intelligent caching
- **User Experience** - Seamless integration with existing UI
- **Scalability** - Handles thousands of users efficiently

---

**🎯 The Dance Events API integration creates a comprehensive, reliable, and user-friendly event discovery system!**


