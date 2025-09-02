import {BaseClient, Paginated} from "@nlc-ai/sdk-core";
import {CreatePaymentMethodRequest, PaymentMethod} from "../types";

export class PaymentMethodsClient extends BaseClient {
  async savePaymentMethod(data: CreatePaymentMethodRequest) {
    const response = await this.request<PaymentMethod>(
      'POST',
      `/`,
      { body: data }
    );
    return response.data!;
  }

  async getPaymentMethods(userID: string, userType: string) {
    const response = await this.request<Paginated<PaymentMethod>>(
      'GET',
      `?userID=${userID}&userType=${userType}`
    );
    return response.data!;
  }

  async getPaymentMethod(id: string): Promise<PaymentMethod> {
    const response = await this.request<PaymentMethod>('GET', `/${id}`);
    return response.data!;
  }

  async setDefaultPaymentMethod(id: string): Promise<PaymentMethod> {
    const response = await this.request<PaymentMethod>('PATCH', `/${id}/set-default`);
    return response.data!;
  }

  async deletePaymentMethod(id: string): Promise<void> {
    await this.request('DELETE', `/${id}`);
  }
}
