import {Lead} from "./leads.types";

export interface LeadWithDetails extends Lead {
  emailSequencesCount?: number;
  scheduledEmailsCount?: number;
  lastEmailSentAt?: Date;
  conversionProbability?: number;
}
