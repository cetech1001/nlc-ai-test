/// <reference lib="dom" />
import {BaseAPI} from "@nlc-ai/api-client";
import {AUTH_USER_TYPE} from "@nlc-ai/types";

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
    userType?: AUTH_USER_TYPE
  ): Promise<LoginResponse> {
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
  }

  async forgotPassword(email: string, userType?: AUTH_USER_TYPE): Promise<{ message: string }> {
    let param = "";
    if (userType) {
      param += `?type=${userType}`;
    }
    return this.makeRequest(`/auth/admin/forgot-password${param}`, {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async verifyCode(email: string, code: string): Promise<{ resetToken: string }> {
    return this.makeRequest('/auth/admin/verify-code', {
      method: 'POST',
      body: JSON.stringify({ email, code }),
    });
  }

  async resetPassword(token: string, password: string, userType?: AUTH_USER_TYPE): Promise<{ message: string }> {
    let param = "";
    if (userType) {
      param += `?type=${userType}`;
    }
    return this.makeRequest(`/auth/admin/reset-password${param}`, {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    });
  }

  async resendCode(email: string): Promise<{ message: string }> {
    return this.makeRequest('/auth/admin/resend-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async getProfile(): Promise<LoginResponse['user']> {
    return this.makeRequest('/auth/profile');
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
      return await this.makeRequest<{ message: string }>('/auth/admin/logout', {
        method: 'POST',
      });
    } finally {
      this.removeToken();
    }
  }
}

export const authAPI = new AuthAPI();
