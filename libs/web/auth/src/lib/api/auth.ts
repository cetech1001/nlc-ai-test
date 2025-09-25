/// <reference lib="dom" />
import { AuthServiceClient } from "@nlc-ai/sdk-auth";
import { UserType } from "@nlc-ai/types";
import { TokenStorage } from "../utils";
import type {
  LoginResponse,
  UpdatePasswordRequest,
  UpdateProfileRequest,
} from "../types";

class AuthAPI {
  private client: AuthServiceClient;
  private tokenStorage: TokenStorage;

  constructor() {
    this.tokenStorage = new TokenStorage({
      cookieOptions: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      }
    });

    this.client = new AuthServiceClient({
      baseURL: process.env.NEXT_PUBLIC_API_URL + '/auth',
      getToken: () => this.tokenStorage.getToken(),
    });
  }

  private setToken(token: string, rememberMe = false): void {
    this.tokenStorage.setToken(token, rememberMe);
  }

  async login(
    email: string,
    password: string,
    userType: UserType,
    rememberMe = false
  ): Promise<LoginResponse> {
    try {
      let result: any;

      switch (userType) {
        case UserType.COACH:
          result = await this.client.loginCoach(email, password);
          break;
        case UserType.CLIENT:
          // Note: Client login might need additional parameters like inviteToken
          throw new Error('Client login not implemented in this method');
        case UserType.ADMIN:
          result = await this.client.loginAdmin(email, password);
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
        return this.client.registerCoach(data);
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
        result = await this.client.coachGoogleAuth(idToken);
        break;
      case UserType.CLIENT:
        // Client Google auth requires invite token
        throw new Error('Client Google auth requires invite token');
      default:
        throw new Error('Invalid user type for Google auth');
    }

    console.log("Result: ", result);

    this.setToken(result.access_token);
    return result;
  }

  async forgotPassword(email: string, userType?: UserType): Promise<{ message: string }> {
    return this.client.forgotPassword(email, userType);
  }

  async verifyCode(email: string, code: string): Promise<LoginResponse & {
    resetToken?: string;
    verified: boolean;
    message: string;
  }> {
    const result: any = await this.client.verifyCode(email, code);

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
    return this.client.resetPassword(token, password, userType);
  }

  async resendCode(
    email: string,
    type: 'verification' | 'reset' = 'verification'
  ): Promise<{ message: string }> {
    return this.client.resendCode(email, type);
  }

  async getProfile(): Promise<LoginResponse['user']> {
    return this.client.getProfile();
  }

  async uploadAvatar(avatarUrl: string): Promise<{ message: string; avatarUrl: string }> {
    return this.client.uploadAvatar(avatarUrl);
  }

  async updateProfile(data: UpdateProfileRequest): Promise<{
    message: string;
    user: LoginResponse['user']
  }> {
    return this.client.updateProfile(data);
  }

  async updatePassword(data: UpdatePasswordRequest): Promise<{ message: string }> {
    return this.client.updatePassword(data);
  }

  async logout(): Promise<{ message: string }> {
    try {
      return await this.client.logout();
    } finally {
      this.removeToken();
    }
  }

  removeToken(): void {
    this.tokenStorage.removeToken();
  }

  getToken(): string | null {
    return this.tokenStorage.getToken();
  }

  hasToken(): boolean {
    return this.tokenStorage.hasToken();
  }
}

export const authAPI = new AuthAPI();
