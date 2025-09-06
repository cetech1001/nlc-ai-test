import {NLCClientConfig} from "@nlc-ai/sdk-main";
import {IntegrationsClient} from "./integrations.client";
import {EmailSyncClient} from "./email-sync.client";


export class IntegrationClient {
  public integrations: IntegrationsClient;
  public emailSync: EmailSyncClient;

  constructor(props: NLCClientConfig) {
    this.integrations = new IntegrationsClient({
      ...props,
    });

    this.emailSync = new EmailSyncClient({
      ...props,
      baseURL: `${props.baseURL}/email-sync`,
    });
  }

}
