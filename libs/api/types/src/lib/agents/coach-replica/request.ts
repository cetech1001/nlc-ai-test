export interface CoachReplicaRequest {
  coachID: string;
  context: string;
  requestType: 'email_response' | 'content_creation' | 'lead_follow_up' | 'client_retention' | 'general_query';
  additionalData?: any;
}
