import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';

/**
 * Decorator to extract the tenant ID from the request headers
 *
 * Usage:
 * @Get()
 * async getStudents(@TenantId() tenantId: string) { ... }
 *
 * The tenant ID is expected via the 'x-tenant-id' header.
 */
export const TenantId = createParamDecorator(
  (data: { optional?: boolean } | undefined, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'] as string;

    if (!tenantId && !data?.optional) {
      throw new BadRequestException('Tenant ID is required');
    }

    return tenantId || '';
  },
);

/**
 * Decorator to extract the user ID from the request headers
 *
 * Usage:
 * @Get()
 * async getProfile(@UserId() userId: string) { ... }
 */
export const UserId = createParamDecorator(
  (data: { optional?: boolean } | undefined, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'] as string;

    if (!userId && !data?.optional) {
      throw new BadRequestException('User ID is required');
    }

    return userId || '';
  },
);

/**
 * Decorator to extract the user role from the request headers
 */
export const UserRoleHeader = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-user-role'] as string || '';
  },
);
