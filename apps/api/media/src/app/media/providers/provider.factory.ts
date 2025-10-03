import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {MediaProvider, MediaProviderType} from '@nlc-ai/types';
import {CloudinaryProvider} from './cloudinary/cloudinary.provider';
import {S3Provider} from './s3/s3.provider';

@Injectable()
export class MediaProviderFactory {
  private readonly logger = new Logger(MediaProviderFactory.name);
  private providers: Map<MediaProviderType, MediaProvider> = new Map();

  constructor(
    private configService: ConfigService,
    private cloudinaryProvider: CloudinaryProvider,
    private s3Provider: S3Provider
  ) {
    this.registerProviders();
  }

  private registerProviders(): void {
    this.providers.set(MediaProviderType.CLOUDINARY, this.cloudinaryProvider);
    this.providers.set(MediaProviderType.S3, this.s3Provider);
  }

  getProvider(providerType?: MediaProviderType): MediaProvider {
    const type = providerType || this.getDefaultProvider();
    const provider = this.providers.get(type);

    if (!provider) {
      throw new Error(`Media provider '${type}' is not supported or not configured`);
    }

    return provider;
  }

  getProviderForVideo(): MediaProvider {
    const videoProvider = this.configService.get<string>('media.provider.videoType');

    if (!videoProvider || !Object.values(MediaProviderType).includes(videoProvider as MediaProviderType)) {
      this.logger.warn(`Invalid video provider configuration: ${videoProvider}. Falling back to S3.`);
      return this.getProvider(MediaProviderType.S3);
    }

    return this.getProvider(videoProvider as MediaProviderType);
  }

  getProviderForImage(): MediaProvider {
    const imageProvider = this.configService.get<string>('media.provider.type');

    if (!imageProvider || !Object.values(MediaProviderType).includes(imageProvider as MediaProviderType)) {
      this.logger.warn(`Invalid image provider configuration: ${imageProvider}. Falling back to Cloudinary.`);
      return this.getProvider(MediaProviderType.CLOUDINARY);
    }

    return this.getProvider(imageProvider as MediaProviderType);
  }

  getProviderForFile(isVideo: boolean): MediaProvider {
    return isVideo ? this.getProviderForVideo() : this.getProviderForImage();
  }

  getDefaultProvider(): MediaProviderType {
    const configuredProvider = this.configService.get<string>('media.provider.type');

    if (!configuredProvider || !Object.values(MediaProviderType).includes(configuredProvider as MediaProviderType)) {
      this.logger.warn(`Invalid or missing media provider configuration: ${configuredProvider}. Falling back to Cloudinary.`);
      return MediaProviderType.CLOUDINARY;
    }

    return configuredProvider as MediaProviderType;
  }

  getProviderType(isVideo: boolean) {
    return isVideo ? MediaProviderType.S3 : MediaProviderType.CLOUDINARY;
  }

  getAllProviders(): MediaProvider[] {
    return Array.from(this.providers.values());
  }

  isProviderSupported(providerType: MediaProviderType): boolean {
    return this.providers.has(providerType);
  }
}
