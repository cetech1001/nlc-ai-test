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

export interface CalendlyUser {
  uri: string;
  name: string;
  slug: string;
  email: string;
  scheduling_url: string;
  timezone: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  current_organization: string;
}

export interface CalendlySettings {
  accessToken?: string;
  userUri?: string;
  organizationUri?: string;
  schedulingUrl?: string;
  isConnected: boolean;
  userName?: string;
  userEmail?: string;
}
