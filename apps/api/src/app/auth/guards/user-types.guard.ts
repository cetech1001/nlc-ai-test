import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class UserTypesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredUserTypes = this.reflector.getAllAndOverride<string[]>('userTypes', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredUserTypes) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredUserTypes.some((type) => user.type === type);
  }
}
