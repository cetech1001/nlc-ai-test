import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ReplayCacheService } from '../services';
import { createHmac } from 'crypto';

/**
 * Guard to protect public endpoints callable from trusted sources (e.g., a landing page).
 *
 * It enforces three layers:
 * 1) Shared secret header X-Landing-Token must match LEADS_PUBLIC_TOKEN.
 * 2) Request must carry X-Landing-Timestamp and X-Landing-Signature. The signature is
 *    HMAC-SHA256 over `${method}|${path}|${rawBody}|${timestamp}` using LEADS_PUBLIC_TOKEN.
 * 3) Replay protection: a signature can only be used once within a short TTL.
 *
 * If you scale horizontally, replace the in-memory ReplayCacheService with a shared store.
 */
@Injectable()
export class LandingTokenGuard implements CanActivate {
  private readonly expectedToken: string | undefined;
  private readonly clockSkewMs: number;
  private readonly replayTtlMs: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly replayCache: ReplayCacheService,
  ) {
    this.expectedToken = this.configService.get<string>('LEADS_PUBLIC_TOKEN');
    // Defaults: 5-minute window, 10-minute replay TTL
    this.clockSkewMs = Number(this.configService.get<string>('LEADS_TOKEN_WINDOW_MS') ?? 5 * 60 * 1000);
    this.replayTtlMs = Number(this.configService.get<string>('LEADS_REPLAY_TTL_MS') ?? 10 * 60 * 1000);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const token = (request.headers['x-landing-token'] || request.headers['X-Landing-Token']) as string | undefined;
    const timestampHeader = (request.headers['x-landing-timestamp'] || request.headers['X-Landing-Timestamp']) as string | undefined;
    const signatureHeader = (request.headers['x-landing-signature'] || request.headers['X-Landing-Signature']) as string | undefined;

    console.log(token, timestampHeader, signatureHeader);

    if (!this.expectedToken) {
      throw new UnauthorizedException('Leads public token not configured');
    }
    if (!token || token !== this.expectedToken) {
      throw new UnauthorizedException('Invalid or missing X-Landing-Token');
    }

    // Require timestamp and signature
    if (!timestampHeader || !signatureHeader) {
      throw new UnauthorizedException('Missing X-Landing-Timestamp or X-Landing-Signature');
    }

    const timestamp = Number(timestampHeader);
    if (!Number.isFinite(timestamp)) {
      throw new BadRequestException('Invalid X-Landing-Timestamp');
    }

    const now = Date.now();
    if (Math.abs(now - timestamp) > this.clockSkewMs) {
      throw new UnauthorizedException('Request timestamp is outside the allowed window');
    }

    // Construct canonical payload
    const method = (request.method || '').toUpperCase();
    const path = request.originalUrl || request.url || '';
    const rawBody = typeof request.body === 'string' ? request.body : JSON.stringify(request.body ?? {});
    const data = `${method}|${path}|${rawBody}|${timestamp}`;

    const expectedSig = createHmac('sha256', this.expectedToken).update(data).digest('hex');
    console.log(expectedSig);
    // Time-safe compare (simple constant-time-ish for small strings)
    if (!this.timingSafeEqual(expectedSig, signatureHeader)) {
      throw new UnauthorizedException('Invalid X-Landing-Signature');
    }

    // Replay protection: reject if signature seen before
    const replayKey = `lead:${signatureHeader}`;
    if (this.replayCache.has(replayKey)) {
      throw new ForbiddenException('Replay detected');
    }
    this.replayCache.add(replayKey, this.replayTtlMs);

    return true;
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
