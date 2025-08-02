import {Integration} from "@nlc-ai/types";
import {Injectable} from "@nestjs/common";
// import {PrismaService} from "../../prisma/prisma.service";
import {IntegrationFactory} from "../factories/integration.factory";
// import {EncryptionService} from "./encryption.service";

@Injectable()
export class TokenManagementService {
  constructor(
    // private readonly prisma: PrismaService,
    // private readonly encryptionService: EncryptionService,
    private readonly integrationFactory: IntegrationFactory,
  ) {}

  async ensureValidToken(integration: Integration, currentToken: string): Promise<string> {
    if (this.isTokenExpired(integration)) {
      const provider = this.integrationFactory.getProvider(integration.platformName);

      if (provider.refreshToken) {
        return provider.refreshToken(integration);
      } else {
        throw new Error(`Token expired for ${integration.platformName} and refresh not supported`);
      }
    }

    return currentToken;
  }

  private isTokenExpired(integration: Integration): boolean {
    if (!integration.tokenExpiresAt) return false;

    const now = new Date();
    const expiryTime = new Date(integration.tokenExpiresAt);
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    return expiryTime <= fiveMinutesFromNow;
  }
}
