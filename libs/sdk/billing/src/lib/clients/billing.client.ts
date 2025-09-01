import {BaseClient} from "@nlc-ai/sdk-core";
import {NLCClientConfig} from "@nlc-ai/sdk-main";
import {PlansClient} from "./plans.client";
import {PaymentsClient} from "./payments.client";
import {TransactionsClient} from "./transactions.client";
import {PaymentMethodsClient} from "./payment-methods.client";
import { SubscriptionsClient } from "./subscriptions.client";
import { InvoicesClient } from "./invoices.client";


export class BillingClient extends BaseClient {
  public invoices: InvoicesClient;
  public plans: PlansClient;
  public payments: PaymentsClient;
  public paymentMethods: PaymentMethodsClient;
  public transactions: TransactionsClient;
  public subscriptions: SubscriptionsClient;

  constructor(config: NLCClientConfig) {
    super(config);

    this.invoices = new InvoicesClient({
      ...config,
      baseURL: `${config.baseURL}/plans`
    });

    this.plans = new PlansClient({
      ...config,
      baseURL: `${config.baseURL}/plans`
    });

    this.payments = new PaymentsClient({
      ...config,
      baseURL: `${config.baseURL}/payments`
    });

    this.paymentMethods = new PaymentMethodsClient({
      ...config,
      baseURL: `${config.baseURL}/payment-methods`
    });

    this.subscriptions = new SubscriptionsClient({
      ...config,
      baseURL: `${config.baseURL}/subscriptions`
    });

    this.transactions = new TransactionsClient({
      ...config,
      baseURL: `${config.baseURL}/transactions`
    });
  }
}
