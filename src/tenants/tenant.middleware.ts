// src/tenants/tenant.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import type { Request, Response, NextFunction } from 'express';

export interface RequestWithTenant extends Request {
  tenantCode?: string;
}

const DEFAULT_TENANT_CODE = 'DONIKO';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: RequestWithTenant, res: Response, next: NextFunction): void {
    const rawHeader = req.headers['x-tenant-id'];

    let tenantCode: string | undefined;

    if (Array.isArray(rawHeader)) {
      tenantCode = rawHeader[0];
    } else if (typeof rawHeader === 'string') {
      tenantCode = rawHeader;
    }

    req.tenantCode = (tenantCode ?? DEFAULT_TENANT_CODE).trim().toUpperCase();

    next();
  }
}
