import {BaseAPI} from './base';
import {CalendarEvent, CalendlyEvent, CalendlyEventType, CalendlySettings, CalendlyUser, UserType} from "@nlc-ai/types";

class CalendlyAPI extends BaseAPI {
  private calendlyBaseUrl = 'https://api.calendly.com';

  async getSettings(userType: UserType = UserType.ADMIN): Promise<CalendlySettings> {
    const response = await this.makeRequest('/integrations/platform/calendly') as any;
    return response.data!;
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

  private async makeCalendlyRequest(endpoint: string, options: RequestInit = {}, userType: UserType = UserType.ADMIN) {
    const settings = await this.getSettings(userType);

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

  async getCurrentUser(userType: UserType = UserType.ADMIN): Promise<CalendlyUser> {
    const response = await this.makeCalendlyRequest('/users/me', {}, userType);
    return response.resource;
  }

  async getScheduledEvents(
    userUri: string,
    startDate?: Date,
    endDate?: Date,
    userType: UserType = UserType.ADMIN,
    status: string = 'active',
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

    const response = await this.makeCalendlyRequest(`/scheduled_events?${params}`, {}, userType);
    return response.collection;
  }

  async getEventTypes(organizationUri?: string, userType: UserType = UserType.ADMIN): Promise<CalendlyEventType[]> {
    const params = new URLSearchParams();
    if (organizationUri) {
      params.append('organization', organizationUri);
    }

    const response = await this.makeCalendlyRequest(`/event_types?${params}`, {}, userType);
    return response.collection;
  }

  async getEventTypeByUri(uri: string, userType: UserType = UserType.ADMIN): Promise<CalendlyEventType> {
    const eventTypeId = uri.split('/').pop();
    const response = await this.makeCalendlyRequest(`/event_types/${eventTypeId}`, {}, userType);
    return response.resource;
  }

  async cancelEvent(eventUri: string, reason?: string, userType: UserType = UserType.ADMIN): Promise<any> {
    const eventId = eventUri.split('/').pop();
    return this.makeCalendlyRequest(`/scheduled_events/${eventId}/cancellation`, {
      method: 'POST',
      body: JSON.stringify({
        reason: reason || 'Cancelled by host'
      }),
    }, userType);
  }

  async getEventInvitees(eventUri: string, userType: UserType = UserType.ADMIN): Promise<any[]> {
    const eventId = eventUri.split('/').pop();
    const response = await this.makeCalendlyRequest(`/scheduled_events/${eventId}/invitees`, {}, userType);
    return response.collection;
  }

  async convertToCalendarEvents(calendlyEvents: CalendlyEvent[], userType: UserType = UserType.ADMIN): Promise<Record<number, CalendarEvent[]>> {
    const eventsByDay: Record<number, CalendarEvent[]> = {};

    for (let i = 0; i < calendlyEvents.length; i++) {
      let event = calendlyEvents[i];

      const startDate = new Date(event.start_time);
      const endDate = new Date(event.end_time);
      const day = startDate.getDate();

      const invitees = await this.getEventInvitees(event.uri, userType);

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
        attendees: invitees.map(m => ({
          name: m.name,
          email: m.email
        })),
        location: event.location?.location || event.location?.join_url || 'TBD',
        status: event.status
      };

      if (!eventsByDay[day]) {
        eventsByDay[day] = [];
      }

      eventsByDay[day].push(calendarEvent);
    }

    /*calendlyEvents.forEach(event => {

    });*/

    // Sort types by time for each day
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

  async isConnected(userType: UserType = UserType.ADMIN): Promise<boolean> {
    try {
      const settings = await this.getSettings(userType);
      return settings.isConnected;
    } catch (error) {
      console.error('Failed to check Calendly connection:', error);
      return false;
    }
  }

  async getSchedulingUrl(userType: UserType = UserType.ADMIN): Promise<string | null> {
    try {
      const settings = await this.getSettings(userType);
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

  async loadEventsForMonth(date: Date, userType: UserType = UserType.ADMIN): Promise<Record<number, CalendarEvent[]>> {
    try {
      const settings = await this.getSettings(userType);

      if (!settings.isConnected || !settings.userUri) {
        throw new Error('Calendly not connected');
      }

      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const calendlyEvents = await this.getScheduledEvents(
        settings.userUri,
        startOfMonth,
        endOfMonth,
        userType,
      );

      return this.convertToCalendarEvents(calendlyEvents, userType);
    } catch (error) {
      console.error('Failed to load Calendly types:', error);
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
