export interface ClientRegistrationResponse {
  message: string;
  clientID: string;
  isExistingClient?: boolean;
  requiresVerification?: boolean;
}

export interface ClientLoginResponse {
  access_token: string;
  client: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
    isActive: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    coaches: Array<{
      coachID: string;
      coachName: string;
      businessName?: string;
      isPrimary: boolean;
      status: string;
    }>;
    currentCoach: {
      coachID: string;
      businessName?: string;
      customDomain?: string;
    };
  };
}

export interface CoachContextSwitchResponse {
  access_token: string;
  currentCoach: {
    coachID: string;
    businessName?: string;
    customDomain?: string;
  };
}
