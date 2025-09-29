import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReplayCacheService } from '../services';
import { createHmac } from 'crypto';

@Injectable()
export class AntiSpamGuard implements CanActivate {
  private readonly expectedToken: string | undefined;
  private readonly clockSkewMs: number;
  private readonly replayTtlMs: number;
  private readonly rateLimitWindow: number;
  private readonly rateLimitMax: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly replayCache: ReplayCacheService,
  ) {
    this.expectedToken = this.configService.get<string>('ANTI_SPAM_TOKEN');
    this.clockSkewMs = Number(this.configService.get<string>('ANTI_SPAM_WINDOW_MS') ?? 5 * 60 * 1000);
    this.replayTtlMs = Number(this.configService.get<string>('ANTI_SPAM_REPLAY_TTL_MS') ?? 10 * 60 * 1000);
    this.rateLimitWindow = Number(this.configService.get<string>('ANTI_SPAM_RATE_WINDOW_MS') ?? 15 * 60 * 1000);
    this.rateLimitMax = Number(this.configService.get<string>('ANTI_SPAM_RATE_MAX') ?? 10);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const token = this.getHeader(request, 'x-anti-spam-token');
    const timestampHeader = this.getHeader(request, 'x-anti-spam-timestamp');
    const signatureHeader = this.getHeader(request, 'x-anti-spam-signature');

    if (!this.expectedToken) {
      throw new UnauthorizedException('Anti-spam protection not configured');
    }

    console.log("Expected token: ", this.expectedToken);
    console.log("Token: ", token);
    console.log("Is a match?: ", this.expectedToken === token);

    if (!token || token !== this.expectedToken) {
      throw new UnauthorizedException('Invalid or missing X-Anti-Spam-Token');
    }

    if (!timestampHeader || !signatureHeader) {
      throw new UnauthorizedException('Missing X-Anti-Spam-Timestamp or X-Anti-Spam-Signature');
    }

    const timestamp = Number(timestampHeader);
    if (!Number.isFinite(timestamp)) {
      throw new BadRequestException('Invalid X-Anti-Spam-Timestamp');
    }

    const now = Date.now();
    if (Math.abs(now - timestamp) > this.clockSkewMs) {
      throw new UnauthorizedException('Request timestamp is outside the allowed window');
    }

    const clientIP = this.getClientIP(request);
    if (await this.isRateLimited(clientIP)) {
      throw new BadRequestException('Rate limit exceeded for this IP');
    }

    const method = (request.method || '').toUpperCase();
    const path = request.originalUrl || request.url || '';
    const rawBody = typeof request.body === 'string' ? request.body : JSON.stringify(request.body ?? {});
    const data = `${method}|${path}|${rawBody}|${timestamp}`;

    const expectedSig = createHmac('sha256', this.expectedToken).update(data).digest('hex');

    if (!this.timingSafeEqual(expectedSig, signatureHeader)) {
      throw new UnauthorizedException('Invalid X-Anti-Spam-Signature');
    }

    const replayKey = `anti-spam:${signatureHeader}`;
    if (await this.replayCache.has(replayKey)) {
      throw new ForbiddenException('Replay detected');
    }
    await this.replayCache.add(replayKey, this.replayTtlMs);

    this.recordRequest(clientIP);

    return true;
  }

  private getHeader(request: any, headerName: string): string | undefined {
    return request.headers[headerName] || request.headers[headerName.toLowerCase()];
  }

  private getClientIP(request: any): string {
    return (
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.headers['x-real-ip'] ||
      request.headers['x-client-ip'] ||
      request.connection?.remoteAddress ||
      request.socket?.remoteAddress ||
      request.ip ||
      'unknown'
    );
  }

  private async isRateLimited(ip: string): Promise<boolean> {
    const rateLimitKey = `rate-limit:${ip}`;
    const now = Date.now();

    const requestHistory = await this.replayCache.getRateLimitData(rateLimitKey);

    if (!requestHistory) {
      return false;
    }

    const windowStart = now - this.rateLimitWindow;
    const recentRequests = requestHistory.filter(timestamp => timestamp > windowStart);

    return recentRequests.length >= this.rateLimitMax;
  }

  private async recordRequest(ip: string): Promise<void> {
    const rateLimitKey = `rate-limit:${ip}`;
    const now = Date.now();

    const requestHistory = await this.replayCache.getRateLimitData(rateLimitKey) || [];

    requestHistory.push(now);

    const windowStart = now - this.rateLimitWindow;
    const recentRequests = requestHistory.filter(timestamp => timestamp > windowStart);

    await this.replayCache.setRateLimitData(rateLimitKey, recentRequests, this.rateLimitWindow);
  }

  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) return false;
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
  }
}
