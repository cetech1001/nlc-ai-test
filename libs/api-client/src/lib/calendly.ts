// apps/admin/src/lib/services/calendly.service.ts
// import { CalendarEvent } from '@/app/data';

import {CalendarEvent} from "@nlc-ai/types";

export interface CalendlyEvent {
  uri: string;
  name: string;
  status: string;
  start_time: string;
  end_time: string;
  event_type: string;
  location?: {
    type: string;
    location?: string;
    join_url?: string;
  };
  invitees_counter: {
    total: number;
    active: number;
    limit: number;
  };
  created_at: string;
  updated_at: string;
  event_memberships: Array<{
    user: string;
    user_email: string;
    user_name: string;
  }>;
  event_guests: Array<{
    email: string;
    created_at: string;
  }>;
}

export interface CalendlyEventType {
  uri: string;
  name: string;
  active: boolean;
  kind: string;
  slug: string;
  scheduling_url: string;
  duration: number;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface CreateEventRequest {
  event_type: string;
  start_time: string;
  end_time: string;
  invitee: {
    email: string;
    name: string;
  };
}

class CalendlyAPI {
  private baseUrl = 'https://api.calendly.com';
  private accessToken: string | null = null;

  constructor() {
    // In a real app, you'd get this from environment variables or user settings
    this.accessToken = process.env.NEXT_PUBLIC_CALENDLY_ACCESS_TOKEN || null;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    if (!this.accessToken) {
      throw new Error('Calendly access token not configured');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Calendly API error: ${response.status} ${error}`);
    }

    return response.json();
  }

  async getCurrentUser() {
    return this.makeRequest('/users/me');
  }

  async getEventTypes(organizationUri?: string) {
    const params = new URLSearchParams();
    if (organizationUri) {
      params.append('organization', organizationUri);
    }

    const response = await this.makeRequest(`/event_types?${params}`);
    return response.collection as CalendlyEventType[];
  }

  async getScheduledEvents(
    userUri: string,
    startDate?: Date,
    endDate?: Date,
    status: string = 'active'
  ) {
    const params = new URLSearchParams({
      user: userUri,
      status,
    });

    if (startDate) {
      params.append('min_start_time', startDate.toISOString());
    }

    if (endDate) {
      params.append('max_start_time', endDate.toISOString());
    }

    const response = await this.makeRequest(`/scheduled_events?${params}`);
    return response.collection as CalendlyEvent[];
  }

  async createEvent(eventTypeUri: string, data: CreateEventRequest) {
    // Note: Calendly doesn't allow direct event creation via API for most plans
    // This would typically redirect to Calendly's booking page
    const eventType = await this.getEventTypeByUri(eventTypeUri);

    // Construct the booking URL with pre-filled data
    const bookingUrl = new URL(eventType.scheduling_url);
    bookingUrl.searchParams.set('name', data.invitee.name);
    bookingUrl.searchParams.set('email', data.invitee.email);

    // For demo purposes, we'll simulate creating an event
    // In reality, you'd redirect the user to the booking URL
    return {
      booking_url: bookingUrl.toString(),
      message: 'Redirect user to Calendly booking page'
    };
  }

  async getEventTypeByUri(uri: string) {
    const response = await this.makeRequest(`/event_types/${uri.split('/').pop()}`);
    return response.resource as CalendlyEventType;
  }

  async cancelEvent(eventUri: string, reason?: string) {
    return this.makeRequest(`/scheduled_events/${eventUri.split('/').pop()}/cancellation`, {
      method: 'POST',
      body: JSON.stringify({
        reason: reason || 'Cancelled by host'
      }),
    });
  }

  // Convert Calendly events to our calendar format
  convertToCalendarEvents(calendlyEvents: CalendlyEvent[]): Record<number, CalendarEvent[]> {
    const eventsByDay: Record<number, CalendarEvent[]> = {};

    calendlyEvents.forEach(event => {
      const startDate = new Date(event.start_time);
      const endDate = new Date(event.end_time);
      const day = startDate.getDate();

      const calendarEvent: CalendarEvent = {
        title: event.name,
        time: `${startDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })} - ${endDate.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })}`,
        color: this.getEventColor(event.event_type),
        type: 'calendly',
        calendlyUri: event.uri,
        attendees: event.event_memberships.map(m => ({
          name: m.user_name,
          email: m.user_email
        })),
        location: event.location?.location || event.location?.join_url || 'TBD',
        status: event.status
      };

      if (!eventsByDay[day]) {
        eventsByDay[day] = [];
      }

      eventsByDay[day].push(calendarEvent);
    });

    // Sort events by time for each day
    Object.keys(eventsByDay).forEach(day => {
      eventsByDay[parseInt(day)].sort((a, b) => {
        const timeA = new Date(`1970/01/01 ${a.time.split(' - ')[0]}`);
        const timeB = new Date(`1970/01/01 ${b.time.split(' - ')[0]}`);
        return timeA.getTime() - timeB.getTime();
      });
    });

    return eventsByDay;
  }

  private getEventColor(eventType: string): string {
    // Map different event types to colors
    const colorMap: Record<string, string> = {
      'consultation': 'bg-blue-500',
      'coaching-session': 'bg-green-500',
      'discovery-call': 'bg-purple-500',
      'follow-up': 'bg-yellow-500',
      'default': 'bg-indigo-500'
    };

    const type = eventType.toLowerCase().replace(/\s+/g, '-');
    return colorMap[type] || colorMap.default;
  }

  // Webhook handler for real-time updates
  async handleWebhook(payload: any) {
    const { event, created_by, event_type } = payload;
    console.log(created_by, event_type);

    switch (event) {
      case 'invitee.created':
        // Handle new booking
        console.log('New booking created:', payload);
        break;
      case 'invitee.canceled':
        // Handle cancellation
        console.log('Booking canceled:', payload);
        break;
      default:
        console.log('Unhandled webhook event:', event);
    }
  }
}

export const calendlyAPI = new CalendlyAPI();
