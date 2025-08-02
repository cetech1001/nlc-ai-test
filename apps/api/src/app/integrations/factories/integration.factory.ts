import {YoutubeService} from "../services/youtube.service";
import {BadRequestException, Injectable} from "@nestjs/common";
import {INTEGRATION_TYPE, IntegrationProvider} from "@nlc-ai/types";

@Injectable()
export class IntegrationFactory {
  private providers = new Map<string, IntegrationProvider>();

  constructor(
    private readonly youtubeService: YoutubeService,
    // private readonly facebookService: FacebookIntegrationService,
    // private readonly skoolService: SkoolIntegrationService,
  ) {
    this.registerProviders();
  }

  private registerProviders() {
    this.providers.set('youtube', this.youtubeService);
    // this.providers.set('facebook', this.facebookService);
    // this.providers.set('skool', this.skoolService);
  }

  getProvider(platform: string): IntegrationProvider {
    const provider = this.providers.get(platform);
    if (!provider) {
      throw new BadRequestException(`Unsupported platform: ${platform}`);
    }
    return provider;
  }

  getProvidersByType(type: INTEGRATION_TYPE): IntegrationProvider[] {
    return Array.from(this.providers.values())
      .filter(provider => provider.integrationType === type);
  }

  getSupportedPlatforms(): string[] {
    return Array.from(this.providers.keys());
  }
}
