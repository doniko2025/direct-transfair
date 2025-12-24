//apps/backend/src/tenants/tenant-context.ts
export type TenantMode = 'single-db' | 'multi-db';

export interface TenantContext {
  code: string; // DONIKO
  clientId: number; // 1
  databaseUrl: string; // DATABASE_URL actuelle
  mode: TenantMode;
}
