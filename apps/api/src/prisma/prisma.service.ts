import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  BadRequestException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Regex pattern for valid tenant/schema identifiers
 * Only allows: lowercase letters, numbers, underscores
 * Must start with a letter
 * Max length: 63 characters (PostgreSQL identifier limit)
 */
const VALID_IDENTIFIER_PATTERN = /^[a-z][a-z0-9_]{0,62}$/;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'error', 'warn']
          : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Validate an identifier to prevent SQL injection
   * @param identifier - The identifier to validate (tenant ID, schema name, etc.)
   * @param fieldName - Name of the field for error messages
   * @throws BadRequestException if identifier is invalid
   */
  private validateIdentifier(identifier: string, fieldName: string): void {
    if (!identifier || typeof identifier !== 'string') {
      throw new BadRequestException(`${fieldName} is required`);
    }

    if (!VALID_IDENTIFIER_PATTERN.test(identifier)) {
      throw new BadRequestException(
        `Invalid ${fieldName} format. Must be lowercase alphanumeric with underscores, ` +
          `start with a letter, and be 1-63 characters long.`,
      );
    }
  }

  /**
   * Execute a query with tenant schema context
   * This enables multi-tenant data isolation
   *
   * @param tenantId - The tenant identifier (must be alphanumeric + underscore)
   * @param callback - The query callback to execute within tenant context
   */
  async withTenant<T>(
    tenantId: string,
    callback: () => Promise<T>,
  ): Promise<T> {
    // Validate tenantId to prevent SQL injection
    this.validateIdentifier(tenantId, 'tenantId');

    // Set the search_path to the tenant's schema
    await this.$executeRawUnsafe(
      `SET search_path TO tenant_${tenantId}, public`,
    );
    try {
      return await callback();
    } finally {
      // Reset to public schema
      await this.$executeRawUnsafe('SET search_path TO public');
    }
  }

  /**
   * Create a new tenant schema
   *
   * @param tenantSlug - The tenant slug (must be alphanumeric + underscore)
   * @throws BadRequestException if tenantSlug is invalid
   */
  async createTenantSchema(tenantSlug: string): Promise<void> {
    // Validate tenantSlug to prevent SQL injection
    this.validateIdentifier(tenantSlug, 'tenantSlug');

    await this.$executeRawUnsafe(
      `SELECT create_tenant_schema('${tenantSlug}')`,
    );
  }

  /**
   * Drop a tenant schema (use with caution)
   *
   * WARNING: This permanently deletes all data in the tenant schema.
   * Ensure proper authorization checks before calling this method.
   *
   * @param tenantSlug - The tenant slug (must be alphanumeric + underscore)
   * @throws BadRequestException if tenantSlug is invalid
   */
  async dropTenantSchema(tenantSlug: string): Promise<void> {
    // Validate tenantSlug to prevent SQL injection
    this.validateIdentifier(tenantSlug, 'tenantSlug');

    await this.$executeRawUnsafe(`SELECT drop_tenant_schema('${tenantSlug}')`);
  }
}
