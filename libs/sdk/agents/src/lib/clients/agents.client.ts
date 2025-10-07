import { ClientEmailClient } from "./client-email.client";
import { CourseStructureClient } from "./course-structure.client";
import { LeadFollowupClient } from "./lead-followup.client";
import { EmailDeliverabilityClient } from "./email-deliverability.client";
import { ContentSuggestionClient } from "./content-suggestion.client";
import { ContentSuggestionConversationClient } from "./content-suggestion-conversation.client";
import { CoachReplicaClient } from "./coach-replica.client";
import { ServiceClientConfig } from "@nlc-ai/sdk-core";

export class AgentsClient {
  public courseStructure: CourseStructureClient;
  public clientEmail: ClientEmailClient;
  public leadFollowup: LeadFollowupClient;
  public emailDeliverability: EmailDeliverabilityClient;
  public contentSuggestion: ContentSuggestionClient;
  public contentConversation: ContentSuggestionConversationClient;
  public coachReplica: CoachReplicaClient;

  constructor(props: ServiceClientConfig) {
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
      baseURL: `${props.baseURL}/content-suggestion`,
    });

    this.contentConversation = new ContentSuggestionConversationClient({
      ...props,
      baseURL: `${props.baseURL}/content-suggestion/chat`,
    });

    this.coachReplica = new CoachReplicaClient({
      ...props,
      baseURL: `${props.baseURL}/replica`,
    });
  }

  updateApiKey(apiKey: string | null) {
    const services = [
      this.courseStructure,
      this.clientEmail,
      this.leadFollowup,
      this.emailDeliverability,
      this.contentConversation,
      this.contentSuggestion,
      this.coachReplica,
    ];

    services.forEach(service => {
      service.updateApiKey(apiKey);
    });
  }
}
