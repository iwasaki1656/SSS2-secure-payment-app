import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
/** Decorator to restrict a route to specific roles (e.g. @Roles('ADMIN')) */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
