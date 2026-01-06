-- EduNexus Multi-Tenant PostgreSQL Initialization
-- This script sets up the base schema structure for multi-tenancy

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create public schema tables (shared across all tenants)
-- These are managed by Prisma, but we ensure the extensions are ready

-- Function to create a new tenant schema
CREATE OR REPLACE FUNCTION create_tenant_schema(tenant_slug TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('CREATE SCHEMA IF NOT EXISTS tenant_%s', tenant_slug);
    RAISE NOTICE 'Created schema: tenant_%', tenant_slug;
END;
$$ LANGUAGE plpgsql;

-- Function to drop a tenant schema (for cleanup)
CREATE OR REPLACE FUNCTION drop_tenant_schema(tenant_slug TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('DROP SCHEMA IF EXISTS tenant_%s CASCADE', tenant_slug);
    RAISE NOTICE 'Dropped schema: tenant_%', tenant_slug;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE edunexus TO edunexus;

-- Log initialization
DO $$
BEGIN
    RAISE NOTICE 'EduNexus database initialized successfully';
END $$;
