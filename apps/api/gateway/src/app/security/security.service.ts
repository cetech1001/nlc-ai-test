import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';

@Injectable()
export class SecurityService {
  private readonly logger = new Logger(SecurityService.name);

  constructor(private readonly configService: ConfigService) {}

  applySecurity(app: any): void {
    // Apply Helmet for security headers
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
    }));

    // Enable compression
    app.use(compression());

    // Trust proxy (for load balancers)
    app.set('trust proxy', 1);

    this.logger.log('Security middleware applied');
  }

  validateApiKey(apiKey: string): boolean {
    // Implement API key validation logic
    const validApiKeys = this.configService.get<string[]>('gateway.apiKeys', []);
    return validApiKeys.includes(apiKey);
  }

  sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized = { ...headers };

    // Remove sensitive headers that shouldn't be forwarded
    delete sanitized['authorization'];
    delete sanitized['cookie'];
    delete sanitized['x-api-key'];

    return sanitized;
  }
}
