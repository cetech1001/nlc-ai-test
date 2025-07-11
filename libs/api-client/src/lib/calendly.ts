import { BaseAPI } from './base';
import {CalendarEvent, CalendlyEvent, CalendlyEventType, CalendlySettings, CalendlyUser} from "@nlc-ai/types";

class CalendlyAPI extends BaseAPI {
  private calendlyBaseUrl = 'https://api.calendly.com';

  async getSettings(): Promise<CalendlySettings> {
    return this.makeRequest('/system-settings/calendly');
  }

  async saveSettings(accessToken: string): Promise<{
    success: boolean;
    message: string;
    data: CalendlySettings;
  }> {
    return this.makeRequest('/system-settings/calendly', {
      method: 'POST',
      body: JSON.stringify({ accessToken }),
    });
  }

  async deleteSettings(): Promise<{ success: boolean; message: string }> {
    return this.makeRequest('/system-settings/calendly', {
      method: 'DELETE',
    });
  }

  private async makeCalendlyRequest(endpoint: string, options: RequestInit = {}) {
    const settings = await this.getSettings();

    if (!settings.isConnected || !settings.accessToken) {
      throw new Error('Calendly is not connected. Please configure in System Settings.');
    }

    const response = await fetch(`${this.calendlyBaseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${settings.accessToken}`,
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

  async getCurrentUser(): Promise<CalendlyUser> {
    const response = await this.makeCalendlyRequest('/users/me');
    return response.resource;
  }

  async getScheduledEvents(
    userUri: string,
    startDate?: Date,
    endDate?: Date,
    status: string = 'active'
  ): Promise<CalendlyEvent[]> {
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

    const response = await this.makeCalendlyRequest(`/scheduled_events?${params}`);
    return response.collection;
  }

  async getEventTypes(organizationUri?: string): Promise<CalendlyEventType[]> {
    const params = new URLSearchParams();
    if (organizationUri) {
      params.append('organization', organizationUri);
    }

    const response = await this.makeCalendlyRequest(`/event_types?${params}`);
    return response.collection;
  }

  async getEventTypeByUri(uri: string): Promise<CalendlyEventType> {
    const eventTypeId = uri.split('/').pop();
    const response = await this.makeCalendlyRequest(`/event_types/${eventTypeId}`);
    return response.resource;
  }

  async cancelEvent(eventUri: string, reason?: string): Promise<any> {
    const eventId = eventUri.split('/').pop();
    return this.makeCalendlyRequest(`/scheduled_events/${eventId}/cancellation`, {
      method: 'POST',
      body: JSON.stringify({
        reason: reason || 'Cancelled by host'
      }),
    });
  }

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

  async isConnected(): Promise<boolean> {
    try {
      const settings = await this.getSettings();
      return settings.isConnected;
    } catch (error) {
      console.error('Failed to check Calendly connection:', error);
      return false;
    }
  }

  async getSchedulingUrl(): Promise<string | null> {
    try {
      const settings = await this.getSettings();
      return settings.schedulingUrl || null;
    } catch (error) {
      console.error('Failed to get scheduling URL:', error);
      return null;
    }
  }

  async getUserUri(): Promise<string | null> {
    try {
      const settings = await this.getSettings();
      return settings.userUri || null;
    } catch (error) {
      console.error('Failed to get user URI:', error);
      return null;
    }
  }

  async loadEventsForMonth(date: Date): Promise<Record<number, CalendarEvent[]>> {
    try {
      const settings = await this.getSettings();

      if (!settings.isConnected || !settings.userUri) {
        throw new Error('Calendly not connected');
      }

      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const calendlyEvents = await this.getScheduledEvents(
        settings.userUri,
        startOfMonth,
        endOfMonth
      );

      return this.convertToCalendarEvents(calendlyEvents);
    } catch (error) {
      console.error('Failed to load Calendly events:', error);
      throw error;
    }
  }

  async handleWebhook(payload: any) {
    const { event } = payload;

    switch (event) {
      case 'invitee.created':
        console.log('New booking created:', payload);
        // Handle new booking - you might want to refresh calendar data
        break;
      case 'invitee.canceled':
        console.log('Booking canceled:', payload);
        // Handle cancellation - you might want to refresh calendar data
        break;
      default:
        console.log('Unhandled webhook event:', event);
    }
  }
}

export const calendlyAPI = new CalendlyAPI();
