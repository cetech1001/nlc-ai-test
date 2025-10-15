import { ClientEmailClient } from "./client-email.client";
import { CourseStructureClient } from "./course-structure.client";
import { LeadFollowupClient } from "./lead-followup.client";
import { EmailDeliverabilityClient } from "./email-deliverability.client";
import { ContentSuggestionClient } from "./content-suggestion.client";
import { CoachReplicaClient } from "./coach-replica.client";
import { PublicChatClient } from "./public-chat.client";
import { ServiceClientConfig } from "@nlc-ai/sdk-core";

export class AgentsClient {
  public courseStructure: CourseStructureClient;
  public clientEmail: ClientEmailClient;
  public leadFollowup: LeadFollowupClient;
  public emailDeliverability: EmailDeliverabilityClient;
  public contentSuggestion: ContentSuggestionClient;
  public coachReplica: CoachReplicaClient;

  constructor(private props: ServiceClientConfig) {
    this.courseStructure = new CourseStructureClient({
      ...props,
      baseURL: `${props.baseURL}/course-structure`,
    });

    this.clientEmail = new ClientEmailClient({
      ...props,
      baseURL: `${props.baseURL}/client-email`,
    });

    this.leadFollowup = new LeadFollowupClient({
      ...props,
      baseURL: `${props.baseURL}/lead-followup`,
    });

    this.emailDeliverability = new EmailDeliverabilityClient({
      ...props,
      baseURL: `${props.baseURL}/email-deliverability`,
    });

    this.contentSuggestion = new ContentSuggestionClient({
      ...props,
      baseURL: `${props.baseURL}/content-suggestions`,
    });

    this.coachReplica = new CoachReplicaClient({
      ...props,
      baseURL: `${props.baseURL}/replica`,
    });
  }

  /**
   * Create a public chat client for a specific coach
   * @param coachID - The coach's ID
   * @returns PublicChatClient instance
   */
  createPublicChatClient(coachID: string): PublicChatClient {
    return new PublicChatClient(
      {
        ...this.props,
        baseURL: `${this.props.baseURL}/public/chat/coach/${coachID}`,
      }
    );
  }

  updateApiKey(apiKey: string | null) {
    const services = [
      this.courseStructure,
      this.clientEmail,
      this.leadFollowup,
      this.emailDeliverability,
      this.contentSuggestion,
      this.coachReplica,
    ];

    services.forEach(service => {
      service.updateApiKey(apiKey);
    });
  }
}

export { PublicChatClient } from './public-chat.client';
