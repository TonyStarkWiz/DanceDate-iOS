# Google Custom Search Integration

## Overview

This implementation provides a tiered event search system that prioritizes Google Custom Search for premium users while maintaining the Dance Events API for free users.

## Architecture

### Tiered Search System

1. **Free Users**: Dance Events API (limited, rate-limited)
2. **Premium Users**: Google Custom Search API (unlimited, real-time)

### Key Components

- `googleCustomSearchService.ts` - Google Custom Search integration
- `danceEventsApi.ts` - Updated with tiered search logic
- `EventListScreen.tsx` - Premium status display
- `PremiumUpgradeScreen.tsx` - Premium upgrade interface

## Google Custom Search Setup

### API Configuration

```typescript
// Google Custom Search API Key
API_KEY: 'AIzaSyBTIR8d1fRiWDH5SUKmgZwyGXnF1s1xfG0'

// Custom Search Engine ID
SEARCH_ENGINE_ID: 'c63b840d0b01d4d28'
```

### Search Engine Configuration

The custom search engine is configured to search for dance events with:
- **Sites**: Dance event websites, social media, event platforms
- **Keywords**: salsa, bachata, tango, ballroom, latin, swing
- **Language**: English
- **Region**: Worldwide

## Features

### Premium Benefits

1. **Google Custom Search**
   - Unlimited search queries (100 free per day)
   - Real-time web results
   - Rich event details with images

2. **Global Event Discovery**
   - Find events from any location
   - Not limited to specific API sources
   - Real-time information

3. **Enhanced Results**
   - Event images and descriptions
   - Location extraction
   - Date and time parsing
   - Price information
   - Dance style detection

### Free Tier (Dance Events API)

- Limited to Dance Events API
- Rate limited (1 hour between calls)
- Basic event information
- Location-based filtering

## Implementation Details

### Premium Status Check

```typescript
const isPremium = await googleCustomSearchService.isUserPremium(userId);
```

Checks Firestore user document for `isPremium` or `premium` field.

### Search Query Building

```typescript
let searchQuery = `dance events ${query}`;
if (location) {
  searchQuery += ` ${location}`;
}
searchQuery += ' salsa bachata tango waltz ballroom latin swing';
```

### Result Transformation

Google search results are transformed to match the app's event format:

```typescript
{
  id: `google_${index}_${Date.now()}`,
  title: result.title,
  description: result.snippet,
  location: extractedLocation,
  date: extractedDate,
  time: extractedTime,
  instructor: extractedInstructor,
  price: extractedPrice,
  imageUrl: result.image?.src,
  source: 'Google Custom Search',
  sourceUrl: result.link,
  danceStyles: extractedDanceStyles,
  isPremium: true
}
```

### Fallback System

If Google Custom Search fails:
1. Falls back to Dance Events API
2. If Dance Events API fails, shows cached events
3. If no cached events, shows sample events

## UI Components

### EventListScreen Premium Status

- Shows "Premium Search" or "Free Search" badge
- Displays "Powered by Google Custom Search" for premium users
- Premium upgrade button

### PremiumUpgradeScreen

- Premium benefits explanation
- Upgrade button (integrated with payment system)
- Test Google search functionality
- Quota information display

## API Quotas and Limits

### Google Custom Search API

- **Free Tier**: 100 queries per day
- **Paid Tier**: $5 per 1000 queries
- **Rate Limit**: 10 queries per second

### Dance Events API

- **Rate Limit**: 1 hour between calls
- **Data Source**: Limited to dance-events.info

## Security Considerations

1. **API Key Protection**: API key is stored in service (should be in environment variables)
2. **User Authentication**: Premium status checked via Firestore
3. **Rate Limiting**: Implemented to prevent abuse
4. **Error Handling**: Graceful fallbacks for API failures

## Future Enhancements

1. **Payment Integration**: Connect with Stripe/Apple Pay for premium upgrades
2. **Quota Tracking**: Track and display actual API usage
3. **Advanced Filtering**: Add more search parameters
4. **Caching**: Cache Google search results for better performance
5. **Analytics**: Track search performance and user behavior

## Testing

### Test Google Search

Use the "Test Google Search" button in PremiumUpgradeScreen to verify:
- API connectivity
- Search result quality
- Result transformation
- Error handling

### Premium Status Testing

1. Set `isPremium: true` in user's Firestore document
2. Verify Google Custom Search is used
3. Check premium UI elements display correctly

## Deployment Notes

1. **Environment Variables**: Move API keys to environment variables
2. **Firestore Rules**: Ensure premium status can be read/written
3. **API Quotas**: Monitor usage and implement proper rate limiting
4. **Error Monitoring**: Set up alerts for API failures

## Troubleshooting

### Common Issues

1. **API Quota Exceeded**: Check daily usage and implement caching
2. **Search Results Poor**: Adjust search engine configuration
3. **Premium Status Not Working**: Verify Firestore user document structure
4. **Rate Limiting**: Implement proper delays between requests

### Debug Tools

- Console logs with 🧪 prefix for easy filtering
- Premium status display in UI
- Test search functionality
- Firestore debug screens


