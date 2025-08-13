import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';

@Injectable()
export class ServiceAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      return false;
    }

    try {
      request['user'] = this.jwtService.verify(token);
      return true;
    } catch {
      return false;
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers?.authorization;

    if (!authHeader) {
      return undefined;
    }

    // Handle "Bearer <token>" format
    if (authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Handle direct token in Authorization header
    if (authHeader && typeof authHeader === 'string' && authHeader.length > 0) {
      return authHeader;
    }

    // Also check for token in custom headers (for service-to-service auth)
    const serviceToken = request.headers['x-service-token'] || request.headers['x-auth-token'];
    if (serviceToken && typeof serviceToken === 'string') {
      return serviceToken;
    }

    return undefined;
  }
}
