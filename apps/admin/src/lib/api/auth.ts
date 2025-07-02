export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
  };
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

class AuthAPI {
  private readonly baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken');
  }

  private setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('adminToken', token);
  }

  private removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('adminToken');
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
    };

    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        this.removeToken();
      }
      throw await response.json().catch(() => ({
        message: `HTTP ${response.status}: ${response.statusText}`,
        statusCode: response.status,
      }));
    }

    return response.json();
  }

  async loginAdmin(email: string, password: string, rememberMe?: boolean): Promise<LoginResponse> {
    const result = await this.makeRequest<LoginResponse>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({email, password, rememberMe}),
    });

    this.setToken(result.access_token);
    return result;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return this.makeRequest('/auth/admin/forgot-password', {
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

  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    return this.makeRequest('/auth/admin/reset-password', {
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

  async logout(): Promise<{ message: string }> {
    try {
      return await this.makeRequest<{ message: string }>('/auth/admin/logout', {
        method: 'POST',
      });
    } finally {
      this.removeToken();
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      await this.getProfile();
      return true;
    } catch {
      this.removeToken();
      return false;
    }
  }
}

export const authAPI = new AuthAPI();
