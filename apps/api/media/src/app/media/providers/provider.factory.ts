import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {MediaProvider, MediaProviderType} from '@nlc-ai/api-types';
import { CloudinaryProvider } from './cloudinary/cloudinary.provider';

@Injectable()
export class MediaProviderFactory {
  private readonly logger = new Logger(MediaProviderFactory.name);
  private providers: Map<MediaProviderType, MediaProvider> = new Map();

  constructor(
    private configService: ConfigService,
    private cloudinaryProvider: CloudinaryProvider,
  ) {
    this.registerProviders();
  }

  private registerProviders(): void {
    this.providers.set(MediaProviderType.CLOUDINARY, this.cloudinaryProvider);
  }

  getProvider(providerType?: MediaProviderType): MediaProvider {
    const type = providerType || this.getDefaultProvider();
    const provider = this.providers.get(type);

    if (!provider) {
      throw new Error(`Media provider '${type}' is not supported or not configured`);
    }

    this.logger.log(`Using media provider: ${type}`);
    return provider;
  }

  getDefaultProvider(): MediaProviderType {
    const configuredProvider = this.configService.get<string>('media.provider.type');

    if (!configuredProvider || !Object.values(MediaProviderType).includes(configuredProvider as MediaProviderType)) {
      this.logger.warn(`Invalid or missing media provider configuration: ${configuredProvider}. Falling back to Cloudinary.`);
      return MediaProviderType.CLOUDINARY;
    }

    return configuredProvider as MediaProviderType;
  }

  getAllProviders(): MediaProvider[] {
    return Array.from(this.providers.values());
  }

  isProviderSupported(providerType: MediaProviderType): boolean {
    return this.providers.has(providerType);
  }

  switchProvider(providerType: MediaProviderType): MediaProvider {
    if (!this.isProviderSupported(providerType)) {
      throw new Error(`Cannot switch to unsupported provider: ${providerType}`);
    }

    this.logger.log(`Switching media provider to: ${providerType}`);
    return this.getProvider(providerType);
  }
}
