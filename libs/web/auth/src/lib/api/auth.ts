import { AuthClient } from "@nlc-ai/sdk-auth";
import {AuthResponse, UserProfile, UserType} from "@nlc-ai/types";
import { TokenStorage } from "../utils";
import type {
  LoginResponse,
} from "../types";
import {UsersClient} from "@nlc-ai/sdk-users";

class AuthAPI {
  private auth: AuthClient;
  private users: UsersClient;
  private tokenStorage: TokenStorage;
  private onTokenUpdate?: (token: string | null) => void;

  constructor() {
    this.tokenStorage = new TokenStorage({
      cookieOptions: {
        secure: process.env.NEXT_PUBLIC_ENV === 'production',
        sameSite: 'lax',
      }
    });

    this.auth = new AuthClient({
      baseURL: process.env.NEXT_PUBLIC_API_URL + '/auth',
      getToken: () => this.tokenStorage.getToken(),
    });

    this.users = new UsersClient({
      baseURL: process.env.NEXT_PUBLIC_API_URL + '/users',
      getToken: () => this.tokenStorage.getToken(),
    });
  }

  setTokenUpdateCallback(callback: (token: string | null) => void): void {
    this.onTokenUpdate = callback;
  }

  private setToken(token: string, rememberMe = false): void {
    this.tokenStorage.setToken(token, rememberMe);
    this.onTokenUpdate?.(token);
  }

  async login(
    email: string,
    password: string,
    userType: UserType,
    rememberMe = false
  ): Promise<AuthResponse> {
    try {
      let result: any;

      switch (userType) {
        case UserType.COACH:
          result = await this.auth.loginCoach(email, password);
          break;
        case UserType.CLIENT:
          // Note: Client login might need additional parameters like inviteToken
          throw new Error('Client login not implemented in this method');
        case UserType.ADMIN:
          result = await this.auth.loginAdmin(email, password);
          break;
        default:
          throw new Error('Invalid user type');
      }

      this.setToken(result.access_token, rememberMe);
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
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    userType: UserType
  ): Promise<{ message: string; coachID?: string; clientID?: string; requiresVerification?: boolean }> {
    const data = { firstName, lastName, email, password };

    switch (userType) {
      case UserType.COACH:
        return this.auth.registerCoach(data);
      case UserType.CLIENT:
        // Client registration requires invite token
        throw new Error('Client registration requires invite token');
      default:
        throw new Error('Invalid user type for registration');
    }
  }

  async googleAuth(idToken: string, userType: UserType): Promise<LoginResponse> {
    let result: any;

    switch (userType) {
      case UserType.COACH:
        result = await this.auth.coachGoogleAuth(idToken);
        break;
      case UserType.CLIENT:
        // Client Google auth requires invite token
        throw new Error('Client Google auth requires invite token');
      default:
        throw new Error('Invalid user type for Google auth');
    }

    this.setToken(result.access_token);
    return result;
  }

  async forgotPassword(email: string, userType?: UserType): Promise<{ message: string }> {
    return this.auth.forgotPassword(email, userType);
  }

  async verifyCode(email: string, code: string): Promise<LoginResponse & {
    resetToken?: string;
    verified: boolean;
    message: string;
  }> {
    const result: any = await this.auth.verifyCode(email, code);

    if (result.access_token) {
      this.setToken(result.access_token);
    }

    return result;
  }

  async resetPassword(
    token: string,
    password: string,
    userType?: UserType
  ): Promise<{ message: string }> {
    return this.auth.resetPassword(token, password, userType);
  }

  async resendCode(
    email: string,
    type: 'verification' | 'reset' = 'verification'
  ): Promise<{ message: string }> {
    return this.auth.resendCode(email, type);
  }

  async getProfile(): Promise<UserProfile> {
    return this.users.profiles.getMyProfile();
  }

  async logout(): Promise<{ message: string }> {
    try {
      return await this.auth.logout();
    } finally {
      this.removeToken();
    }
  }

  removeToken(): void {
    this.tokenStorage.removeToken();
    this.onTokenUpdate?.(null);
  }

  hasToken(): boolean {
    return this.tokenStorage.hasToken();
  }
}

export const authAPI = new AuthAPI();
