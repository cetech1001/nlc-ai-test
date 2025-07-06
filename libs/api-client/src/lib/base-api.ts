/// <reference lib="dom" />
export class BaseAPI {
  protected readonly baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || '';
  }

  protected getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('adminToken');
  }

  protected removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('adminToken');
  }

  protected async makeRequest<T>(
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
}
