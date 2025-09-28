import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly publicTokenName: string;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector
  ) {
    this.publicTokenName = this.configService.get<string>('PUBLIC_TOKEN_NAME', '');
  }

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler()) ||
      this.reflector.get<boolean>('isPublic', context.getClass());

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException('Missing authentication token');
    }

    try {
      const secret = this.configService.get<string>('JWT_SECRET');

      request['user'] = this.jwtService.verify(token, { secret });
      request['token'] = token;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid authentication token');
    }
  }

  private extractTokenFromRequest(request: any): string | undefined {
    const cookieToken = request.cookies?.[this.publicTokenName];
    if (cookieToken && typeof cookieToken === 'string' && cookieToken.length > 0) {
      return cookieToken;
    }

    const authHeader = request.headers?.authorization;
    if (authHeader) {
      if (authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
      }

      if (typeof authHeader === 'string' && authHeader.length > 0) {
        return authHeader;
      }
    }

    const serviceToken = request.headers['x-service-token'] || request.headers['x-auth-token'];
    if (serviceToken && typeof serviceToken === 'string') {
      return serviceToken;
    }

    return undefined;
  }
}
