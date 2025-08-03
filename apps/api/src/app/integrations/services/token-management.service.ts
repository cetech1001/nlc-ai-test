import { Injectable } from "@nestjs/common";
import { Integration } from "@nlc-ai/types";
import { PrismaService } from "../../prisma/prisma.service";
import { EncryptionService } from "./encryption.service";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class TokenManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryptionService: EncryptionService,
    private readonly configService: ConfigService,
  ) {}

  async ensureValidToken(integration: Integration, currentToken: string): Promise<string> {
    if (this.isTokenExpired(integration)) {
      return await this.refreshToken(integration);
    }

    return currentToken;
  }

  private async refreshToken(integration: Integration): Promise<string> {
    const { refreshToken } = await this.getDecryptedTokens(integration);

    if (!refreshToken) {
      throw new Error(`No refresh token available for ${integration.platformName}`);
    }

    if (integration.platformName === 'youtube' || integration.platformName === 'gmail') {
      return this.refreshGoogleToken(integration, refreshToken);
    }

    throw new Error(`Token refresh not implemented for ${integration.platformName}`);
  }

  private async refreshGoogleToken(integration: Integration, refreshToken: string): Promise<string> {
    const params = new URLSearchParams({
      client_id: this.configService.get('GOOGLE_CLIENT_ID', ''),
      client_secret: this.configService.get('GOOGLE_CLIENT_SECRET', ''),
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    });

    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(`Failed to refresh Google token: ${response.statusText}`);
    }

    const tokenData: any = await response.json();

    const encryptedToken = await this.encryptionService.encrypt(tokenData.access_token);
    await this.prisma.integration.update({
      where: { id: integration.id },
      data: {
        accessToken: encryptedToken,
        tokenExpiresAt: new Date(Date.now() + tokenData.expires_in * 1000),
      },
    });

    return tokenData.access_token;
  }

  private isTokenExpired(integration: Integration): boolean {
    if (!integration.tokenExpiresAt) return false;

    const now = new Date();
    const expiryTime = new Date(integration.tokenExpiresAt);
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    return expiryTime <= fiveMinutesFromNow;
  }

  private async getDecryptedTokens(integration: Integration): Promise<{
    accessToken: string;
    refreshToken?: string;
  }> {
    const accessToken = await this.encryptionService.decrypt(integration.accessToken || '');
    const refreshToken = integration.refreshToken
      ? await this.encryptionService.decrypt(integration.refreshToken)
      : undefined;

    return { accessToken, refreshToken };
  }
}
