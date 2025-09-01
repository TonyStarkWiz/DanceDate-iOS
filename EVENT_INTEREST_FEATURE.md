# Event Interest Feature

## Overview
The "I'm Interested" button allows users to express interest in dance events. This feature enables:

- **Event Discovery**: Users can mark events they're interested in
- **Social Matching**: Find other users interested in the same events
- **Notifications**: Get updates about events they're interested in
- **Personal Dashboard**: View all events they've shown interest in

## Implementation

### UI Components
- **Interest Button**: Heart icon with "I'm Interested" text on each event card
- **Visual Feedback**: Success alert when interest is recorded
- **Event Actions**: Button layout with interest and external link options

### Backend Services
- **EventInterestService**: Handles CRUD operations for event interests
- **Firestore Collection**: `event_interests` stores user interest data
- **Security Rules**: Users can only access their own interests

### Data Model
```typescript
interface EventInterest {
  id: string;           // userId_eventId
  userId: string;        // User who showed interest
  eventId: string;       // Event they're interested in
  eventTitle: string;    // Event title for quick reference
  eventInstructor: string; // Event instructor
  eventLocation: string; // Event location
  eventSource: string;   // Source of event (API, Firestore, etc.)
  interestedAt: Date;    // When interest was recorded
  eventData?: DisplayableEvent; // Full event data
}
```

## Features

### ✅ Current Implementation
- [x] Interest button on each event card
- [x] Save interest to Firestore
- [x] User feedback with success alert
- [x] Security rules for data protection
- [x] Service methods for CRUD operations

### 🔄 Future Enhancements
- [ ] Show interest status (interested/not interested)
- [ ] Interest count on events
- [ ] Find users interested in same events
- [ ] Event recommendations based on interests
- [ ] Interest notifications and updates
- [ ] Interest history in user profile
- [ ] Bulk interest management

## Usage

### For Users
1. Browse events in the event list
2. Click "I'm Interested" button on any event
3. Get confirmation that interest was recorded
4. View interested events in profile (future feature)

### For Developers
```typescript
// Save interest
await eventInterestService.saveEventInterest(userId, event);

// Check if user is interested
const isInterested = await eventInterestService.isUserInterested(userId, eventId);

// Get user's interested events
const interests = await eventInterestService.getUserInterestedEvents(userId);

// Get users interested in an event
const interestedUsers = await eventInterestService.getUsersInterestedInEvent(eventId);
```

## Security
- Users can only access their own interests
- Interest IDs are prefixed with user ID for security
- Firestore rules prevent unauthorized access
- All operations require authentication

## Integration Points
- **Event List Screen**: Shows interest buttons
- **User Profile**: Future location for interest history
- **Matching System**: Can use interests for better matches
- **Notifications**: Can notify about event updates
- **Analytics**: Track popular events and user engagement


