import {BaseClient} from "@nlc-ai/sdk-core";
import {NLCClientConfig} from "@nlc-ai/sdk-main";
import {AccountsClient} from "./accounts.client";
import { ThreadsClient } from "./threads.client";

export class EmailClient extends BaseClient {
  public accounts: AccountsClient;
  public threads: ThreadsClient;

  constructor(props: NLCClientConfig) {
    super(props);

    this.accounts = new AccountsClient({
      ...props,
      baseURL: `${props.baseURL}/accounts`,
    });

    this.threads = new ThreadsClient({
      ...props,
      baseURL: `${props.baseURL}/threads`,
    });
  }

  async sendEmail(data: any) {
    const response = await this.request('POST', '/send', { body: data });
    return response.data!;
  }
}
