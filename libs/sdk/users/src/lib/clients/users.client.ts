import {CoachesClient} from "./coaches.client";
import {ServiceClientConfig} from "@nlc-ai/sdk-core";
import {ClientsClient} from "./clients.client";
import { ProfilesClient } from "./profiles.client";
import { RelationshipClient } from "./relationship.client";

export class UsersClient{
  public coaches: CoachesClient;
  public clients: ClientsClient;
  public profiles: ProfilesClient;
  public relationship: RelationshipClient;

  constructor(config: ServiceClientConfig) {
    this.coaches = new CoachesClient({
      ...config,
      baseURL: `${config.baseURL}/coaches`,
    });

    this.clients = new ClientsClient({
      ...config,
      baseURL: `${config.baseURL}/clients`,
    });

    this.profiles = new ProfilesClient({
      ...config,
      baseURL: `${config.baseURL}/profiles`,
    });

    this.relationship = new RelationshipClient({
      ...config,
      baseURL: `${config.baseURL}`,
    });
  }

  updateApiKey(apiKey: string | null) {
    const services = [
      this.coaches, this.clients, this.profiles
    ];

    services.forEach(service => {
      service.updateApiKey(apiKey);
    });
  }
}
