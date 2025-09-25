import { BaseClient } from "@nlc-ai/sdk-core";
import { UserType, LoginResponse, UpdateProfileRequest } from "@nlc-ai/types";

export class AuthServiceClient extends BaseClient {
  async loginCoach(email: string, password: string, rememberMe?: boolean) {
    const response = await this.request('POST', '/coach/login', {
      body: { email, password, rememberMe }
    });
    return response.data!;
  }

  async registerCoach(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const response = await this.request<{
      message: string;
      coachID?: string;
      clientID?: string;
      requiresVerification?: boolean;
    }>('POST', '/coach/register', { body: data });
    return response.data!;
  }

  async coachGoogleAuth(idToken: string) {
    const response = await this.request('POST', '/coach/google/auth', {
      body: { idToken }
    });
    return response.data!;
  }

  async loginClient(email: string, password: string) {
    const response = await this.request('POST', '/client/login', {
      body: { email, password }
    });
    return response.data!;
  }

  async registerClient(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    inviteToken: string;
  }) {
    const response = await this.request('POST', '/client/register', { body: data });
    return response.data!;
  }

  async clientGoogleAuth(idToken: string, inviteToken: string) {
    const response = await this.request('POST', '/client/google', {
      body: { idToken, inviteToken }
    });
    return response.data!;
  }

  async switchCoachContext(coachID: string) {
    const response = await this.request('POST', '/client/switch-coach', {
      body: { coachID }
    });
    return response.data!;
  }

  async loginAdmin(email: string, password: string, rememberMe?: boolean) {
    const response = await this.request('POST', '/admin/login', {
      body: { email, password, rememberMe }
    });
    return response.data!;
  }

  async forgotPassword(email: string, userType?: UserType) {
    const queryParam = userType ? `?type=${userType}` : '';
    const response = await this.request<{ message: string; }>('POST', `/forgot-password${queryParam}`, {
      body: { email }
    });
    return response.data!;
  }

  async verifyCode(email: string, code: string) {
    const response = await this.request('POST', '/verify-code', {
      body: { email, code }
    });
    return response.data!;
  }

  async resetPassword(token: string, password: string, userType?: UserType) {
    const queryParam = userType ? `?type=${userType}` : '';
    const response = await this.request<{ message: string }>('POST', `/reset-password${queryParam}`, {
      body: { token, password }
    });
    return response.data!;
  }

  async resendCode(email: string, type: 'verification' | 'reset' = 'verification') {
    const response = await this.request<{ message: string }>('POST', '/resend-code', {
      body: { email, type }
    });
    return response.data!;
  }

  async logout() {
    const response = await this.request<{ message: string }>('POST', '/logout');
    return response.data!;
  }

  async getProfile() {
    const response = await this.request<LoginResponse['user']>('GET', '/profile');
    return response.data!;
  }

  async uploadAvatar(avatarUrl: string) {
    const response = await this.request<{ message: string; avatarUrl: string }>('POST', '/upload-avatar', {
      body: { avatarUrl }
    });
    return response.data!;
  }

  async updateProfile(data: UpdateProfileRequest) {
    const response = await this.request<{
      message: string;
      user: LoginResponse['user']
    }>('PATCH', '/profile', { body: data });
    return response.data!;
  }

  async updatePassword(data: { newPassword: string }) {
    const response = await this.request<{ message: string }>('PATCH', '/password', { body: data });
    return response.data!;
  }
}
