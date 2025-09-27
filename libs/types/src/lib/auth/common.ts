import {UserType} from "../users";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  type: UserType;
}

export interface ValidatedGoogleUser {
  providerID: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
}
