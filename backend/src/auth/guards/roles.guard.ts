import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';

/**
 * RolesGuard — enforces role-based access control (RBAC) on routes.
 * Must be used AFTER JwtAuthGuard so that request.user is already populated.
 * Security: Role is read from the verified JWT payload (set by JwtAuthGuard),
 * not from request body, preventing privilege escalation.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no @Roles decorator is present, allow all authenticated users
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !requiredRoles.includes(user.role)) {
      throw new ForbiddenException({
        code: 'ACCESS_DENIED',
        message: 'You do not have permission to access this resource.',
      });
    }

    return true;
  }
}
