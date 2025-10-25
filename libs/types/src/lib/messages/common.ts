import {UserType} from "../users";

export type ConversationType =
  | 'coach_to_coach'
  | 'client_to_client'
  | 'client_to_coach'
  | 'coach_to_admin';

export interface ConversationParticipant {
  id: string;
  type: UserType;
  name: string;
  avatarUrl?: string;
}
