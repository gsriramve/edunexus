import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Execute a query with tenant schema context
   * This enables multi-tenant data isolation
   */
  async withTenant<T>(tenantId: string, callback: () => Promise<T>): Promise<T> {
    // Set the search_path to the tenant's schema
    await this.$executeRawUnsafe(`SET search_path TO tenant_${tenantId}, public`);
    try {
      return await callback();
    } finally {
      // Reset to public schema
      await this.$executeRawUnsafe('SET search_path TO public');
    }
  }

  /**
   * Create a new tenant schema
   */
  async createTenantSchema(tenantSlug: string): Promise<void> {
    await this.$executeRawUnsafe(`SELECT create_tenant_schema('${tenantSlug}')`);
  }

  /**
   * Drop a tenant schema (use with caution)
   */
  async dropTenantSchema(tenantSlug: string): Promise<void> {
    await this.$executeRawUnsafe(`SELECT drop_tenant_schema('${tenantSlug}')`);
  }
}
