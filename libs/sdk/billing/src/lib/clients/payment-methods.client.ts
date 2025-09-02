import {BaseClient} from "@nlc-ai/sdk-core";
import {PaymentMethod} from "../types";

export class PaymentMethodsClient extends BaseClient {
  async getPaymentMethods(userID: string, userType: string): Promise<PaymentMethod[]> {
    const response = await this.request<PaymentMethod[]>(
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
