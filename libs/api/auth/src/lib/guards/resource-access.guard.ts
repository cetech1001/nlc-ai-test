import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserType, type AuthUser } from '@nlc-ai/types';

export const CheckResourceAccess = Reflector.createDecorator<{
  paramName?: string;
  queryName?: string;
  userTypes?: UserType[];
  allowSelfAccess?: boolean;
}>();

@Injectable()
export class ResourceAccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.get(CheckResourceAccess, context.getHandler());

    if (!options) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user: AuthUser = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (options.userTypes?.includes(UserType.ADMIN) && user.type === UserType.ADMIN) {
      return true;
    }

    if (options.userTypes?.includes(user.type)) {
      return true;
    }

    if (options.allowSelfAccess) {
      const resourceID = this.getResourceID(request, options);

      if (resourceID && resourceID === user.id) {
        return true;
      }
    }

    throw new ForbiddenException('Access denied to this resource');
  }

  private getResourceID(request: any, options: any): string | undefined {
    if (options.paramName && request.params[options.paramName]) {
      return request.params[options.paramName];
    }

    if (options.queryName && request.query[options.queryName]) {
      return request.query[options.queryName];
    }

    return undefined;
  }
}

// Additional specialized guard for coach-client relationships


// Usage examples:

/*
// Allow only admins and the resource owner
@CheckResourceAccess({
  userTypes: [UserType.ADMIN],
  allowSelfAccess: true
})
@UseGuards(ResourceAccessGuard)
@Get(':id')
getProfile(@Param('id') id: string) {
  // Only admin or the user themselves can access
}

// Allow coaches to access if they have a relationship with the client
@UseGuards(CoachClientAccessGuard)
@Get('clients/:id')
getClient(@Param('id') id: string) {
  // Admin can access any, coaches can access their clients, clients can access themselves
}

// Check query parameter instead of path parameter
@CheckResourceAccess({
  queryName: 'coachID',
  userTypes: [UserType.ADMIN],
  allowSelfAccess: true
})
@UseGuards(ResourceAccessGuard)
@Get('clients')
getClients(@Query('coachID') coachID?: string) {
  // Only admin or the coach themselves can filter by coachID
}

// Admin-only access
@CheckResourceAccess({
  userTypes: [UserType.ADMIN],
  allowSelfAccess: false
})
@UseGuards(ResourceAccessGuard)
@Delete(':id')
deleteUser(@Param('id') id: string) {
  // Only admins can delete users
}
*/
