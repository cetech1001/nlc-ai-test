import {BaseClient, Paginated} from "@nlc-ai/sdk-core";
import {PaymentMethod} from "../types";

export class PaymentMethodsClient extends BaseClient{
  async getPaymentMethods(userID: string): Promise<Paginated<PaymentMethod>> {
    const params = new URLSearchParams();

    if (userID) params.append('userID', userID);

    const response = await this.request<Paginated<PaymentMethod>>('GET', `/?${params}`);
    return response.data!;
  }
}
