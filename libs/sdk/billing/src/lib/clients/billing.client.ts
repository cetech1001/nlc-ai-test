import {ServiceClientConfig} from "@nlc-ai/sdk-core";
import {PlansClient} from "./plans.client";
import {PaymentsClient} from "./payments.client";
import {TransactionsClient} from "./transactions.client";
import {PaymentMethodsClient} from "./payment-methods.client";
import { SubscriptionsClient } from "./subscriptions.client";
import { InvoicesClient } from "./invoices.client";
import { PaymentRequestsClient } from "./payment-requests.client";


export class BillingClient {
  public invoices: InvoicesClient;
  public plans: PlansClient;
  public payments: PaymentsClient;
  public paymentMethods: PaymentMethodsClient;
  public paymentRequests: PaymentRequestsClient;
  public transactions: TransactionsClient;
  public subscriptions: SubscriptionsClient;

  constructor(config: ServiceClientConfig) {
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

    this.paymentRequests = new PaymentRequestsClient({
      ...config,
      baseURL: `${config.baseURL}/payment-requests`
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

  updateApiKey(apiKey: string | null) {
    const services = [
      this.invoices, this.plans, this.paymentMethods,
      this.payments, this.paymentRequests, this.subscriptions,
      this.transactions
    ];

    services.forEach(service => {
      service.updateApiKey(apiKey);
    });
  }
}
