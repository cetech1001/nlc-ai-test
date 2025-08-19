export enum UserType {
  coach = 'coach',
  admin = 'admin',
  client = 'client',
}

export interface AuthUser {
  sub: string;
  id: string;
  email: string;
  type: UserType;
  firstName?: string;
  lastName?: string;
  role?: string; // For admins
  coachID?: string; // For clients
  tenant?: string; // Tenant context
}

export interface ValidatedGoogleUser {
  providerID: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

export interface AuthenticatedUser {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    businessName?: string;
    isVerified: boolean;
    avatarUrl?: string;
  };
}
