/// <reference lib="dom"/>
import { BaseClient } from '@nlc-ai/sdk-core';
import { CalendarEvent } from '@nlc-ai/types';

export interface CalendlyEventResponse {
  uri: string;
  name: string;
  status: string;
  start_time: string;
  end_time: string;
  event_type: string;
  location?: {
    location?: string;
    join_url?: string;
  };
  invitees?: Array<{
    name: string;
    email: string;
  }>;
}

export interface CalendlyIntegrationStatus {
  isConnected: boolean;
  userUri?: string;
  name?: string;
  email?: string;
  schedulingUrl?: string;
  timezone?: string;
  avatarUrl?: string;
  lastSync?: string;
  eventCount?: number;
}

export interface CalendlyEventType {
  uri: string;
  name: string;
  active: boolean;
  scheduling_url: string;
  duration: number;
  kind: string;
  slug: string;
  color: string;
}

export class CalendlyClient extends BaseClient {
  /**
   * Check if Calendly is connected for the current user
   */
  async isConnected(): Promise<boolean> {
    try {
      const integration = await this.getIntegrationStatus();
      return integration.isConnected === true;
    } catch (error) {
      console.error('Failed to check Calendly connection:', error);
      return false;
    }
  }

  /**
   * Get Calendly integration status and configuration
   */
  async getIntegrationStatus(): Promise<CalendlyIntegrationStatus> {
    const response = await this.request<CalendlyIntegrationStatus>('GET', '/platform/calendly');
    return response.data!;
  }

  /**
   * Get scheduling URL for the current user
   */
  async getSchedulingUrl(): Promise<string | null> {
    try {
      const integration = await this.getIntegrationStatus();
      return integration.schedulingUrl || null;
    } catch (error) {
      console.error('Failed to get scheduling URL:', error);
      return null;
    }
  }

  /**
   * Get user URI for the current user
   */
  async getUserUri(): Promise<string | null> {
    try {
      const integration = await this.getIntegrationStatus();
      return integration.userUri || null;
    } catch (error) {
      console.error('Failed to get user URI:', error);
      return null;
    }
  }

  /**
   * Load Calendly events for a date range
   */
  async loadEvents(startDate: Date, endDate: Date): Promise<CalendlyEventResponse[]> {
    const response = await this.request<{ events: CalendlyEventResponse[] }>(
      'POST',
      '/calendly/events',
      {
        body: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        }
      }
    );
    return response.data!.events;
  }

  /**
   * Load events for a specific month and convert to calendar format
   */
  async loadEventsForMonth(date: Date): Promise<Record<number, CalendarEvent[]>> {
    try {
      const integration = await this.getIntegrationStatus();

      if (!integration.isConnected || !integration.userUri) {
        throw new Error('Calendly not connected');
      }

      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const calendlyEvents = await this.loadEvents(startOfMonth, endOfMonth);

      return this.convertToCalendarEvents(calendlyEvents);
    } catch (error) {
      console.error('Failed to load Calendly events:', error);
      throw error;
    }
  }

  /**
   * Get Calendly event types
   */
  async getEventTypes(organizationUri?: string): Promise<CalendlyEventType[]> {
    const params = new URLSearchParams();
    if (organizationUri) {
      params.append('organizationUri', organizationUri);
    }

    const response = await this.request<{ eventTypes: CalendlyEventType[] }>(
      'GET',
      `/calendly/event-types?${params}`
    );
    return response.data!.eventTypes;
  }

  /**
   * Cancel a Calendly event
   */
  async cancelEvent(eventUri: string, reason?: string): Promise<void> {
    // Encode the event URI for use in URL
    const encodedUri = encodeURIComponent(eventUri);

    await this.request(
      'POST',
      `/calendly/events/${encodedUri}/cancel`,
      {
        body: { reason }
      }
    );
  }

  /**
   * Convert Calendly events to calendar events format
   */
  private convertToCalendarEvents(calendlyEvents: CalendlyEventResponse[]): Record<number, CalendarEvent[]> {
    const eventsByDay: Record<number, CalendarEvent[]> = {};

    for (const event of calendlyEvents) {
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
        attendees: event.invitees?.map(invitee => ({
          name: invitee.name,
          email: invitee.email
        })) || [],
        location: event.location?.location || event.location?.join_url || 'TBD',
        status: event.status
      };

      if (!eventsByDay[day]) {
        eventsByDay[day] = [];
      }

      eventsByDay[day].push(calendarEvent);
    }

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

  /**
   * Get color for event type
   */
  private getEventColor(eventType: string): string {
    const colorMap: Record<string, string> = {
      'consultation': 'bg-blue-500',
      'coaching-session': 'bg-green-500',
      'discovery-call': 'bg-purple-500',
      'follow-up': 'bg-yellow-500',
      'meeting': 'bg-indigo-500',
      'call': 'bg-pink-500',
      'default': 'bg-indigo-500'
    };

    const eventTypeName = eventType.toLowerCase().replace(/\s+/g, '-');
    const typeKey = Object.keys(colorMap).find(key =>
      eventTypeName.includes(key) || eventType.toLowerCase().includes(key)
    );

    return colorMap[typeKey || 'default'];
  }
}
