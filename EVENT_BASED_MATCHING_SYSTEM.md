# Event-Based Partner Matching System

## Overview
The Event-Based Partner Matching System uses dance event interests to find compatible partners. When users show interest in events, the system automatically finds other users with similar interests and suggests matches based on shared event preferences.

## How It Works

### 1. Event Interest Collection
- Users click "I'm Interested" on dance events
- Interests are saved to `event_interests` collection in Firestore
- Each interest includes event details and user information

### 2. Match Discovery Algorithm
- **Shared Events Analysis**: Finds users interested in the same events
- **Match Strength Calculation**: Calculates compatibility based on shared interests
- **Common Interests Extraction**: Identifies dance styles and preferences
- **Real-time Suggestions**: Continuously updates match suggestions

### 3. Match Strength Formula
```
Base Strength = (Shared Events / Total User Interests) × 100
Bonus = min(Shared Events × 10, 30)
Final Strength = min(Base Strength + Bonus, 100)
```

## Data Flow

### User Shows Interest
1. User clicks "I'm Interested" on event
2. `eventInterestService.saveEventInterest()` saves to Firestore
3. Interest is stored with user ID and event details

### Match Discovery
1. `eventBasedMatchingService.findEventBasedMatches()` runs
2. Gets user's interested events
3. Finds other users interested in same events
4. Calculates match strength and common interests
5. Returns sorted list of potential matches

### Match Creation
1. User clicks "Create Match" on suggestion
2. `eventBasedMatchingService.createEventBasedMatch()` creates match
3. Match is saved to `event_matches` collection
4. Both users can now chat and interact

## Collections Structure

### event_interests
```typescript
{
  id: "userId_eventId",
  userId: "user123",
  eventId: "event456",
  eventTitle: "Salsa Night",
  eventInstructor: "Maria Rodriguez",
  eventLocation: "New York, NY",
  eventSource: "dance_events_api",
  interestedAt: Timestamp,
  eventData: DisplayableEvent
}
```

### event_matches
```typescript
{
  id: "user1_user2",
  userId1: "user123",
  userId2: "user456",
  sharedEvents: ["event1", "event2"],
  matchStrength: 85,
  matchedAt: Timestamp,
  status: "pending" | "accepted" | "declined",
  lastActivity: Timestamp
}
```

## Features

### ✅ Current Implementation
- [x] Event interest tracking and storage
- [x] Match discovery based on shared events
- [x] Match strength calculation
- [x] Common interests extraction
- [x] Match creation and management
- [x] Real-time match suggestions
- [x] Match analytics and statistics
- [x] Security rules for data protection

### 🔄 Future Enhancements
- [ ] Advanced matching algorithms (location, skill level, availability)
- [ ] Event-based chat rooms for shared interests
- [ ] Match notifications and alerts
- [ ] Event attendance tracking
- [ ] Match success rate analytics
- [ ] Group event suggestions for matched pairs

## Usage Examples

### For Users
1. **Browse Events**: Go to event list and show interest in events
2. **Find Matches**: Visit "Event-Based Matches" to see suggestions
3. **Create Matches**: Click "Create Match" on interesting suggestions
4. **Start Chatting**: Message matched partners about shared events

### For Developers
```typescript
// Find matches for a user
const matches = await eventBasedMatchingService.findEventBasedMatches(userId);

// Create a match
await eventBasedMatchingService.createEventBasedMatch(user1, user2, sharedEvents);

// Get user's matches
const userMatches = await eventBasedMatchingService.getUserEventMatches(userId);

// Get match analytics
const analytics = await eventBasedMatchingService.getMatchAnalytics(userId);
```

## Integration Points

### Event List Screen
- Shows "I'm Interested" buttons
- Saves user interests to Firestore
- Triggers match discovery

### Event-Based Matching Screen
- Displays match suggestions
- Shows shared events and common interests
- Allows match creation and messaging

### Chat System
- Enables communication between matched users
- Can be enhanced with event-specific chat rooms

### User Profile
- Shows user's interested events
- Displays match history and statistics

## Security & Privacy
- Users can only access their own interests and matches
- Match data is protected by Firestore security rules
- User profiles are anonymized in match suggestions
- All operations require authentication

## Performance Considerations
- Match discovery uses efficient Firestore queries
- Results are cached and updated periodically
- Real-time updates use polling (can be enhanced with listeners)
- Match strength calculations are optimized

## Testing the System

### 1. Create Test Data
- Multiple users show interest in same events
- Different users have overlapping interests
- Various event types and locations

### 2. Test Match Discovery
- Verify matches are found for users with shared interests
- Check match strength calculations
- Ensure common interests are extracted correctly

### 3. Test Match Creation
- Create matches between users
- Verify match data is saved correctly
- Test match status updates

### 4. Test Real-time Features
- Check that new interests trigger match updates
- Verify match suggestions refresh properly
- Test analytics and statistics

## Benefits

### For Users
- **Meaningful Connections**: Find partners with genuine shared interests
- **Event Discovery**: Discover new events through matches
- **Social Dancing**: Connect with people who want to attend same events
- **Skill Development**: Find partners for specific dance styles

### For Platform
- **Engagement**: Users are motivated to show interest in events
- **Retention**: Matches create ongoing interactions
- **Data Insights**: Understand popular events and user preferences
- **Community Building**: Foster connections around shared interests

## Technical Architecture

### Services
- **EventInterestService**: Manages event interest CRUD operations
- **EventBasedMatchingService**: Handles match discovery and creation
- **ChatService**: Enables communication between matched users

### Data Flow
```
User Interest → Firestore → Match Discovery → Match Suggestions → Match Creation → Chat
```

### Scalability
- Firestore queries are optimized for large datasets
- Match discovery can be enhanced with background processing
- Real-time features can use Firestore listeners for better performance
- Analytics can be processed asynchronously

This system creates a powerful way to connect dance enthusiasts based on their genuine interests in specific events, leading to more meaningful and successful partnerships! 🎉


