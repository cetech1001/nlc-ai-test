export type CALENDAR_EVENT_TYPE = 'calendly' | 'manual';

export interface CalendarEvent {
  title: string;
  time: string;
  color: string;
  type?: CALENDAR_EVENT_TYPE;
  calendlyUri?: string;
  location?: string;
  attendees?: Array<{
    name: string;
    email: string;
  }>;
  status?: string;
}

export interface Appointment {
  id?: string;
  name: string;
  date: string;
  time: string;
  avatar: string;
  type?: CALENDAR_EVENT_TYPE;
  calendlyUri?: string;
  location?: string;
  attendees?: Array<{
    name: string;
    email: string;
  }>;
}

export interface CalendarDay {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
  eventCount: number;
}
