/// <reference lib="dom" />
import {BaseAPI} from "@nlc-ai/api-client";
import {AUTH_TYPES} from "@nlc-ai/types";

import {LoginResponse, UpdatePasswordRequest, UpdateProfileRequest} from "../types";


class AuthAPI extends BaseAPI{
  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('adminToken', token);
  }

  async login(
    email: string,
    password: string,
    rememberMe?: boolean,
    userType?: AUTH_TYPES
  ): Promise<LoginResponse> {
    try {
      let param = "";
      if (userType) {
        param += `?type=${userType}`;
      }
      const result = await this.makeRequest<LoginResponse>(`/auth/login${param}`, {
        method: 'POST',
        body: JSON.stringify({email, password, rememberMe}),
      });

      this.setToken(result.access_token);
      return result;
    } catch (e: any) {
      if (e.code === 'EMAIL_NOT_VERIFIED') {
        throw {
          ...e,
          requiresVerification: true,
          email: e.email,
        };
      }
      throw e;
    }
  }

  async register(
    fullName: string,
    email: string,
    password: string
  ): Promise<{ message: string; coachId: string }> {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password }),
    });
  }

  async googleLogin(idToken: string): Promise<LoginResponse> {
    const result = await this.makeRequest<LoginResponse>('/auth/google/login', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });

    this.setToken(result.access_token);
    return result;
  }

  async googleRegister(idToken: string): Promise<LoginResponse> {
    const result = await this.makeRequest<LoginResponse>('/auth/google/register', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });

    this.setToken(result.access_token);
    return result;
  }

  async forgotPassword(email: string, userType?: AUTH_TYPES): Promise<{ message: string }> {
    let param = "";
    if (userType) {
      param += `?type=${userType}`;
    }
    return this.makeRequest(`/auth/forgot-password${param}`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyCode(email: string, code: string): Promise<LoginResponse & {
    resetToken?: string;
    verified: boolean;
    message: string;
  }> {
    const result: any = await this.makeRequest('/auth/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });

    if (result.access_token) {
      this.setToken(result.access_token);
    }

    return result;
  }

  async resetPassword(token: string, password: string, userType?: AUTH_TYPES): Promise<{ message: string }> {
    let param = "";
    if (userType) {
      param += `?type=${userType}`;
    }
    return this.makeRequest(`/auth/reset-password${param}`, {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async resendCode(email: string, type: 'verification' | 'reset' = 'verification'): Promise<{ message: string }> {
    return this.makeRequest('/auth/resend-code', {
      method: 'POST',
      body: JSON.stringify({ email, type }),
    });
  }

  async getProfile(): Promise<LoginResponse['user']> {
    return this.makeRequest('/auth/profile');
  }

  async uploadAvatar(formData: FormData) {
    return this.makeRequest('/auth/upload-avatar', {
      method: 'POST',
      body: formData,
    });
  }

  async updateProfile(data: UpdateProfileRequest): Promise<{ message: string; user: LoginResponse['user'] }> {
    return this.makeRequest('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updatePassword(data: UpdatePasswordRequest): Promise<{ message: string }> {
    return this.makeRequest('/auth/password', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<{ message: string }> {
    try {
      return await this.makeRequest<{ message: string }>('/auth/logout', {
        method: 'POST',
      });
    } finally {
      this.removeToken();
    }
  }
}

export const authAPI = new AuthAPI();
