import {BaseServiceClient} from "@nlc-ai/sdk-core";

export class AuthServiceClient extends BaseServiceClient {
  async loginCoach(email: string, password: string) {
    const response = await this.request('POST', '/auth/coach/login', {
      body: { email, password }
    });
    return response.data!;
  }

  async registerCoach(data: any) {
    const response = await this.request('POST', '/auth/coach/register', { body: data });
    return response.data!;
  }

  async loginClient(email: string, password: string, inviteToken: string) {
    const response = await this.request('POST', '/auth/client/login', {
      body: { email, password, inviteToken }
    });
    return response.data!;
  }

  async refreshToken(refreshToken: string) {
    const response = await this.request('POST', '/auth/refresh', {
      body: { refreshToken }
    });
    return response.data!;
  }

  async updateProfile(data: any) {
    const response = await this.request('PATCH', '/auth/profile', { body: data });
    return response.data!;
  }
}
