import { DanceEvent, DanceEventsApiResponse } from '../types/event';

// API Configuration
const DANCE_EVENTS_API_BASE = 'https://www.dance-events.info/api/v1';
const DANCE_EVENTS_TOKEN = '55493fc73a27d20a9ac3402e8b5eff61';

const EVENTBRITE_API_BASE = 'https://www.eventbriteapi.com/v3';
const EVENTBRITE_TOKEN = 'S7K32K3AIW2OVXQZLUHE';

export class DanceEventsApiService {
  // Main dance events API
  static async searchEvents(
    location: string,
    radius: number = 25,
    danceStyles?: string[]
  ): Promise<DanceEvent[]> {
    try {
      const params = new URLSearchParams({
        token: DANCE_EVENTS_TOKEN,
        location: location,
        radius: radius.toString(),
      });

      if (danceStyles && danceStyles.length > 0) {
        params.append('styles', danceStyles.join(','));
      }

      const response = await fetch(`${DANCE_EVENTS_API_BASE}/events.json?${params}`);
      const data: DanceEventsApiResponse = await response.json();

      if (data.status === 'success' && data.events) {
        return data.events;
      } else {
        throw new Error(data.message || 'Failed to fetch events');
      }
    } catch (error) {
      console.error('Error fetching dance events:', error);
      throw error;
    }
  }

  // Eventbrite API integration
  static async searchEventbriteEvents(
    location: string,
    query: string = 'dance',
    radius: number = 25
  ): Promise<DanceEvent[]> {
    try {
      const params = new URLSearchParams({
        token: EVENTBRITE_TOKEN,
        'location.address': location,
        q: query,
        radius: radius.toString(),
        expand: 'venue',
      });

      const response = await fetch(`${EVENTBRITE_API_BASE}/events/search/?${params}`);
      const data = await response.json();

      if (data.events) {
        return data.events.map((event: any) => ({
          id: parseInt(event.id),
          title: event.name.text,
          instructor: event.organizer.name || 'Unknown',
          location: event.venue?.address?.localized_address_display || 'Location TBD',
          tags: event.category?.name ? [event.category.name] : [],
          lat: event.venue?.latitude || 0,
          lng: event.venue?.longitude || 0,
          url: event.url,
          website_url: event.url,
          organizer: event.organizer.name,
          description: event.description.text,
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching Eventbrite events:', error);
      throw error;
    }
  }

  // Combined search from multiple sources
  static async searchAllEvents(
    location: string,
    radius: number = 25,
    danceStyles?: string[]
  ): Promise<DanceEvent[]> {
    try {
      const [danceEvents, eventbriteEvents] = await Promise.allSettled([
        this.searchEvents(location, radius, danceStyles),
        this.searchEventbriteEvents(location, 'dance', radius),
      ]);

      const events: DanceEvent[] = [];

      if (danceEvents.status === 'fulfilled') {
        events.push(...danceEvents.value);
      }

      if (eventbriteEvents.status === 'fulfilled') {
        events.push(...eventbriteEvents.value);
      }

      // Remove duplicates based on title and location
      const uniqueEvents = events.filter((event, index, self) =>
        index === self.findIndex(e => 
          e.title === event.title && e.location === event.location
        )
      );

      return uniqueEvents;
    } catch (error) {
      console.error('Error in combined event search:', error);
      throw error;
    }
  }

  // Get event details
  static async getEventDetails(eventId: number): Promise<DanceEvent | null> {
    try {
      const params = new URLSearchParams({
        token: DANCE_EVENTS_TOKEN,
        id: eventId.toString(),
      });

      const response = await fetch(`${DANCE_EVENTS_API_BASE}/event/${eventId}.json?${params}`);
      const data = await response.json();

      if (data.status === 'success' && data.event) {
        return data.event;
      }

      return null;
    } catch (error) {
      console.error('Error fetching event details:', error);
      return null;
    }
  }
}
