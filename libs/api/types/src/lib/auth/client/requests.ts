import {GoogleAuthRequest, RegistrationRequest} from "../common";

export interface ClientRegistrationRequest extends RegistrationRequest{
  inviteToken: string;
  provider?: 'google';
  providerID?: string;
  avatarUrl?: string;
}

export interface ClientGoogleAuthRequest extends GoogleAuthRequest{
  inviteToken: string;
}

export interface SwitchCoachContextRequest {
  coachID: string;
}
