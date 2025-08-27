import {CoachesClient} from "./coaches.client";
import {BaseClient} from "@nlc-ai/sdk-core";
import {ClientsClient} from "./clients.client";
import {NLCClientConfig} from "@nlc-ai/sdk-main";
import { ProfileClient } from "./profile.client";

export class UsersClient extends BaseClient{
  public coaches: CoachesClient;
  public clients: ClientsClient;
  public profile: ProfileClient;

  constructor(config: NLCClientConfig) {
    super(config);

    this.coaches = new CoachesClient({
      ...config,
      baseURL: `${config.baseURL}/coaches`,
    });

    this.clients = new ClientsClient({
      ...config,
      baseURL: `${config.baseURL}/clients`,
    });

    this.profile = new ProfileClient({
      ...config,
      baseURL: `${config.baseURL}/profiles`,
    });
  }
}
