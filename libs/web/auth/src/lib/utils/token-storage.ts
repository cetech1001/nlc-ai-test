/// <reference lib="dom">

export interface TokenStorageOptions {
  cookieName?: string;
  localStorageKey?: string;
  cookieOptions?: {
    secure?: boolean;
    sameSite?: 'strict' | 'lax' | 'none';
    domain?: string;
    path?: string;
  };
}

const DEFAULT_OPTIONS: Required<TokenStorageOptions> = {
  cookieName: process.env.NEXT_PUBLIC_TOKEN_NAME || 'nlc_auth_token',
  localStorageKey: process.env.NEXT_PUBLIC_TOKEN_NAME || 'nlc_auth_token',
  cookieOptions: {
    secure: true,
    sameSite: 'lax',
    domain: undefined,
    path: '/',
  },
};

export class TokenStorage {
  private readonly options: Required<TokenStorageOptions>;

  constructor(options: TokenStorageOptions = {}) {
    this.options = { ...DEFAULT_OPTIONS, ...options };

    if (typeof window !== 'undefined' && !this.options.cookieOptions.domain) {
      this.options.cookieOptions.domain = this.getBaseDomain();
    }
  }

  private getBaseDomain(): string | undefined {
    if (typeof window === 'undefined') return undefined;

    const hostname = window.location.hostname;

    if (hostname === 'localhost' || hostname.includes('localhost') || /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return undefined;
    }

    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return `.${parts.slice(-2).join('.')}`;
    }

    return undefined;
  }

  setToken(token: string, rememberMe = false): void {
    if (typeof window === 'undefined') return;

    try {
      this.setCookie(token, rememberMe);
    } catch (error) {
      console.warn('Failed to set auth cookie, falling back to localStorage:', error);
    }

    console.log(`Attempting to store token ${token} at ${this.options.localStorageKey}`);

    try {
      localStorage.setItem(this.options.localStorageKey, token);
    } catch (error) {
      console.error('Failed to set token in localStorage:', error);
    }
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      const cookieToken = this.getCookie();
      if (cookieToken) return cookieToken;
    } catch (error) {
      console.warn('Failed to read auth cookie:', error);
    }

    try {
      return localStorage.getItem(this.options.localStorageKey);
    } catch (error) {
      console.warn('Failed to read from localStorage:', error);
      return null;
    }
  }

  removeToken(): void {
    if (typeof window === 'undefined') return;

    try {
      this.removeCookie();
    } catch (error) {
      console.warn('Failed to remove auth cookie:', error);
    }

    try {
      localStorage.removeItem(this.options.localStorageKey);
    } catch (error) {
      console.warn('Failed to remove from localStorage:', error);
    }
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  private setCookie(token: string, rememberMe: boolean): void {
    const { cookieName, cookieOptions } = this.options;
    const expires = rememberMe
      ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 24 * 60 * 60 * 1000);

    let cookie = `${cookieName}=${encodeURIComponent(token)}; expires=${expires.toUTCString()}; path=${cookieOptions.path}`;

    if (cookieOptions.secure) {
      cookie += '; Secure';
    }

    if (cookieOptions.sameSite) {
      cookie += `; SameSite=${cookieOptions.sameSite}`;
    }

    if (cookieOptions.domain) {
      cookie += `; Domain=${cookieOptions.domain}`;
    }

    document.cookie = cookie;
  }

  private getCookie(): string | null {
    if (typeof document === 'undefined') return null;

    const { cookieName } = this.options;
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === cookieName) {
        return decodeURIComponent(value);
      }
    }

    return null;
  }

  private removeCookie(): void {
    const { cookieName, cookieOptions } = this.options;

    let cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${cookieOptions.path}`;
    if (cookieOptions.domain) {
      cookie += `; Domain=${cookieOptions.domain}`;
    }
    document.cookie = cookie;

    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${cookieOptions.path}`;
  }
}
